import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { search_field_validator } from "./validators/search_field.directive";
import { HttpParams } from "@angular/common/http";
import { CuratorService } from "../curator.service";
import { DatabasesService } from "src/app/databases/services/databases.service";
@Component({
  selector: "curator-search",
  templateUrl: "./curator-search.component.html",
  styleUrls: ["./curator-search.component.scss"],
})
export class CuratorSearchComponent implements OnInit {
  constructor(protected databaseService: DatabasesService) {}
  biocuratorSearchForm: UntypedFormGroup;

  // filter by resource
  resources = {
    selected_resources: new Set(),
    display_resource_suggesion: false,
  };
  
  all_resources = ["dome", "disprot", "ped"];

  filtered_resources = new Set();

  search_fields = [
    {
      field: "displayedName",
      text: "Biocurator name",
    },
    {
      field: "orcid_id",
      text: "ORCID",
    },
  ];

  // search field selection
  search_field: string = "displayedName";

  // search text field
  @Input()
  search_text: string = "";

  // parent event to send the data
  @Output() urlStringEvent = new EventEmitter<any>();

  search_resource(event) {
    let value = event.target.value;
    if (value == "") {
      this.filtered_resources = new Set(this.all_resources);
    } else {
      this.filtered_resources = new Set(
        this.all_resources.filter((name) =>
          name.toUpperCase().includes(value.toUpperCase())
        )
      );
    }
    this.resources.display_resource_suggesion =
      this.filtered_resources.size > 0;
  }

  add_resource(resource: string) {
    let filtered = this.all_resources.filter(
      (x) => x.toUpperCase() == resource.toUpperCase()
    );

    if (filtered.length == 1) {
      let [res] = filtered;
      this.resources.selected_resources.add(res);
    }
    this.resources.display_resource_suggesion = false;
  }

  remove_selection(resource: string) {
    this.resources.selected_resources.delete(resource);
  }

  ngOnInit(): void {
    this.biocuratorSearchForm = new UntypedFormGroup({
      search_field: new UntypedFormControl(this.search_field, [
        Validators.required,
        search_field_validator(this.search_fields.map((x) => x.field)),
      ]),
      search_text: new UntypedFormControl(this.search_text),
      selected_resources: new UntypedFormControl(this.resources.selected_resources, [
        Validators.required,
      ]),
    });

    this.databaseService.get_resources().subscribe((response: Object & { data: Array<{ resource_id: string}>}) => {
      this.all_resources = response.data.map(resource => resource.resource_id)
    })
  }

  get selected_resources() {
    return this.biocuratorSearchForm.get("selected_resources");
  }

  onSubmit() {

    const filter_field = this.biocuratorSearchForm.value.search_field;
    const query = this.biocuratorSearchForm.value.search_text || "";
    const resources = Array.from(
      this.biocuratorSearchForm.value.selected_resources
    );

    const params = {filter_field, query, 'resources[]': resources}

    this.urlStringEvent.emit(params);

  }
}
