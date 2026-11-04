import { Component, Input, OnInit } from "@angular/core";
import { MessageService } from "primeng/api";
import { ChipsAddEvent, ChipsRemoveEvent } from "primeng/chips";
import { Resource } from "../../../models/resource.model";
import { ResourcesService } from "../../../resource/service/resources.service";

/**
 * Lets the managers add and remove the hosts allowed in the entity_uri of their reports.
 * Every change is saved right away and the list is replaced by the one the server returns.
 */
@Component({
  selector: "allowed-hosts",
  templateUrl: "./allowed-hosts.component.html",
  styleUrls: ["./allowed-hosts.component.scss"],
})
export class AllowedHostsComponent implements OnInit {
  @Input() resource: Resource;

  hosts: string[] = [];
  saving = false;

  constructor(
    private resourceService: ResourcesService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.hosts = [...this.resource.allowedUrlsPrefix];
  }

  get resourceHosts(): string[] {
    return [
      ...new Set([
        this.resource.resource_url.host,
        this.resource.resource_uri.host,
      ]),
    ];
  }

  get hasGithub(): boolean {
    return this.hosts.some((url) => url.includes("://github.com"));
  }

  onAdd({ value }: ChipsAddEvent) {
    this.save({ add: [value.trim()] });
  }

  onRemove({ value }: ChipsRemoveEvent) {
    this.save({ remove: [value] });
  }

  private save(update: { add?: string[]; remove?: string[] }) {
    const previous = this.resource.allowedUrlsPrefix;
    this.saving = true;
    this.resourceService
      .updateAllowedHosts(this.resource.resource_id, update)
      .subscribe({
        next: (resource) => {
          this.resource.allowedUrlsPrefix = resource.allowedUrlsPrefix;
          this.hosts = [...resource.allowedUrlsPrefix];
          this.saving = false;
        },
        error: ({ error }) => {
          // the chip was already added or removed on screen, the saved list is shown again
          this.hosts = [...previous];
          this.saving = false;
          const message = Array.isArray(error?.message)
            ? error.message.join("\n")
            : error?.message;
          this.messageService.add({
            severity: "warn",
            summary: "The allowed hosts were not updated",
            detail: message ?? "Please try again later",
          });
        },
      });
  }
}
