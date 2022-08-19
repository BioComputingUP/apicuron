import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-curator",
  templateUrl: "./curator.component.html",
  styleUrls: ["./curator.component.scss"],
})
export class CuratorComponent implements OnInit {
  selected_resources = [];

  constructor() {}

  resource_search = false;

  resources = ["DOME", "Disprot", "PED"];

  filtered_resources = [];

  search_resource_event(event) {
    let value = event.target.value;
    if (value == "") {
      this.filtered_resources = this.resources;
    } else {      
      this.filtered_resources = this.resources.filter((name) =>
        name.toUpperCase().includes(value.toUpperCase())
      );
    }
    this.resource_search = this.filtered_resources.length > 0;
  }

  add_resource(resource: string) {
    
    let filtered =this.resources.filter(x => x.toUpperCase() == resource.toUpperCase())

    if(filtered.length == 1){
      let [res] = filtered
      this.selected_resources.push(res)
    }
  }

  remove_selection(resource: string) {
    this.selected_resources = this.selected_resources.filter(
      (res) => res != resource
    );
  }

  ngOnInit(): void {}
}
