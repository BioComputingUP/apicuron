import { Component, Input, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { MessageService } from "primeng/api";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { ConfirmationService } from "../../../../../projects/apicuron-util/src/lib/confirmation";
import { AuthService } from "../../../auth/auth.service";
import { Resource } from "../../../models/resource.model";
import { User } from "../../../models/User.model";
import {
  ResourceManager,
  ResourcesService,
} from "../../../resource/service/resources.service";

/**
 * Lets the managers of a resource, and the admins, add and remove its managers by ORCID iD.
 * Every change asks for confirmation and is saved right away.
 */
@Component({
  selector: "resource-managers",
  templateUrl: "./resource-managers.component.html",
})
export class ResourceManagersComponent implements OnInit {
  @Input() resource: Resource;

  managers: ResourceManager[] = [];
  loading = true;
  saving = false;
  user$: Observable<User>;
  // sandbox.orcid.org outside production
  orcid_main_url = environment.orcid_main_url;

  // the checksum is checked by the server
  orcid = new FormControl("", [
    Validators.required,
    Validators.pattern(/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/),
  ]);

  constructor(
    private resourceService: ResourcesService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    authService: AuthService,
  ) {
    this.user$ = authService.user$;
  }

  ngOnInit(): void {
    this.resourceService.getManagers(this.resource.resource_id).subscribe({
      next: (managers) => {
        this.managers = managers;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.showError("The managers could not be loaded", error);
      },
    });
  }

  confirmAdd() {
    const orcid_id = this.orcid.value.trim();
    this.confirmationService.confirm({
      title: "Add a manager",
      message: `${orcid_id} will be able to edit ${this.resource.resource_name}, submit and delete its reports, and change its managers.`,
      confirmationText: "Add manager",
      cancelText: "Cancel",
      accept: () =>
        this.save(
          this.resourceService.addManager(this.resource.resource_id, orcid_id),
          () => this.orcid.reset(""),
        ),
      reject: () => {},
    });
  }

  confirmRemove(manager: ResourceManager, user: User) {
    const self = manager.orcid_id == user.orcid_id;
    this.confirmationService.confirm({
      title: self ? "Remove yourself" : "Remove a manager",
      message: self
        ? `You will no longer manage ${this.resource.resource_name}.`
        : `${this.label(manager)} will no longer manage ${this.resource.resource_name}.`,
      confirmationText: "Remove",
      cancelText: "Cancel",
      accept: () =>
        this.save(
          this.resourceService.removeManager(
            this.resource.resource_id,
            manager.orcid_id,
          ),
          () => {
            // the resource leaves the sidebar, a reload fetches the profile again
            if (self && user.role != "admin") {
              window.location.assign("/dashboard");
            }
          },
        ),
      reject: () => {},
    });
  }

  label(manager: ResourceManager) {
    return `${manager.displayedName} (${manager.orcid_id})`;
  }

  // returns a promise, so the confirmation dialog stays open until the change is saved
  private save(request: Observable<ResourceManager[]>, onSaved = () => {}) {
    this.saving = true;
    return new Promise<void>((resolve) => {
      request.subscribe({
        next: (managers) => {
          this.managers = managers;
          this.saving = false;
          onSaved();
          resolve();
        },
        error: (error) => {
          this.saving = false;
          this.showError("The managers were not updated", error);
          resolve();
        },
      });
    });
  }

  private showError(summary: string, { error }) {
    const message = Array.isArray(error?.message)
      ? error.message.join("\n")
      : error?.message;
    this.messageService.add({
      severity: "warn",
      summary,
      detail: message ?? "Please try again later",
      // long enough to read the server message
      life: 10000,
    });
  }
}
