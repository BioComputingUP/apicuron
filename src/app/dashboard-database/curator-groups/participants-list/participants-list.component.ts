import { Component, Input, OnInit } from "@angular/core";
import { GroupsService } from "../services/groups.service";
import { BehaviorSubject, Observable } from "rxjs";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { User } from "src/app/models/User.model";
import { map, pluck, shareReplay, switchMap, take } from "rxjs/operators";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { DatabasesService } from "src/app/databases/services/databases.service";
import { ToastrService } from "ngx-toastr";
import { ResourceGroup } from "../../../models/resource-group.model";

@Component({
  selector: "participants-list",
  templateUrl: "./participants-list.component.html",
  styleUrls: ["./participants-list.component.scss"],
})
export class ParticipantsListComponent implements OnInit {
  currentParticipants$ = new BehaviorSubject<any[]>([]);
  show_form: "update" | false = false;
  form: FormGroup;
  curation_groups = ["Professional Curators", "Community Curators"];
  currentGroup$: Observable<ResourceGroup>;

  constructor(
    protected route: ActivatedRoute,
    protected databaseService: DatabasesService,
    protected groups: GroupsService,
    protected formBuilder: FormBuilder,
    protected toast: ToastrService,
    protected groupsService: GroupsService
  ) {}

  ngOnInit(): void {
    // this.groups.currentParticipants$.subscribe(participants => {
    //   this.currentParticipants$.next(participants);
    // });

    this.currentGroup$ = this.groupsService.getCurrentGroup();
  }

  edit_group(group) {
    this.form = this.formBuilder.group({
      curation_group: [group.curation_group, [Validators.required]],
    });
    this.show_form = "update";
  }

  get_curator_name(orcid_id: string): string {
    const participant = this.currentParticipants$
      .getValue()
      .find((p) => p[0] == orcid_id);
    return participant[0];
  }

  submit_form() {}

  // submit_form() {
  //   if (this.form.valid) {
  //     if (this.show_form == 'update') {
  //       const curator = this.form.value;

  //       this.groupsService.add_league_member(curator).subscribe(
  //         ({ data }: { data }) => {
  //           this.toast.success("League Successfully Updated");

  //           const curators = this.currentParticipants$.getValue();
  //           const updated_index = curators.findIndex(curator => data['curator_name'] == curator['curator_name']);
  //           if (updated_index != -1) {
  //             curators[updated_index] = data;
  //             this.currentParticipants$.next(curators);
  //           }
  //         },
  //         error => {
  //           console.error("Error updating the group", error);
  //         }
  //       );
  //     }
  //   }
  // }
}
