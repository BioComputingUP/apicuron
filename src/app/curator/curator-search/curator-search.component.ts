import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { search_field_validator } from './validators/search_field.directive';

@Component({
  selector: 'curator-search',
  templateUrl: './curator-search.component.html',
  styleUrls: ['./curator-search.component.scss']
})
export class CuratorSearchComponent implements OnInit {


  constructor() {}

  biocuratorSearchForm: FormGroup;

  // filter by resource
  selected_resources = new Set();
  display_resource_suggesion = false;

  @Input() resources =["DOME", "Disprot", "PED"];

  filtered_resources = new Set();
  
  search_fields = [
    {
      field: 'full_name',
      text: 'Biocurator name'
    },
    {
      field: 'orcid_id',
      text: 'ORCID'
    } 
  ]

  // search field selection
  search_field :string;

  // search text field
  search_text: string;
  search_resource(event) {
    let value = event.target.value;
    if (value == "") {
      this.filtered_resources = new Set(this.resources);
    } else {      
      this.filtered_resources = new Set(this.resources.filter((name) =>
        name.toUpperCase().includes(value.toUpperCase()))
      );
    }
    this.display_resource_suggesion = this.filtered_resources.size > 0;
  }

  add_resource(resource: string) {
    
    let filtered =this.resources.filter(x => x.toUpperCase() == resource.toUpperCase())

    if(filtered.length == 1){
      let [res] = filtered
      this.selected_resources.add(res)
    }
    this.display_resource_suggesion = false;
  }

  remove_selection(resource: string) {
    this.selected_resources.delete(resource)
  }



  ngOnInit(): void {
    this.biocuratorSearchForm = new FormGroup({
      search_field: new FormControl(this.search_field, [
        Validators.required,
        search_field_validator(this.search_fields.map(x => x.field))

      ])
    })
  }
}
