import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { combineLatest, Observable } from "rxjs";
import { map, pluck, tap } from "rxjs/operators";
import { DatabasesService } from "../services/databases.service";

@Component({
  selector: "app-database-create",
  templateUrl: "./database-create.component.html",
  styleUrls: ["./database-create.component.scss"],
})
export class DatabaseCreateComponent implements OnInit {
  validate_resource_id$: Observable<boolean>;

  constructor(
    private formBuilder: FormBuilder,
    protected databasesService: DatabasesService
  ) {
    this.databasesService
      .GetResources()
      .pipe(pluck("data"))
      .subscribe((resources:Array<any>) => (this.resource_id_list = resources.map(x =>x.resource_id)));
  }

  resource_id_list: Array<string> = [];
  createDatabaseForm: FormGroup;

  ngOnInit(): void {
    this.createDatabaseForm = this.formBuilder.group({
      resource_uri: "",
      resource_description: "",
      resource_id: '',
      resource_long_name: "",
      resource_name: "",
      resource_url: "",
    });
  }
  get resource_id (){
    return this.createDatabaseForm.get('resource_id')
  }
}
