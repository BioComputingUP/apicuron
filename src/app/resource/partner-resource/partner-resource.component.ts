import { Component, Input, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
@Component({
  selector: 'partner-resource',
  templateUrl: './partner-resource.component.html',
  styleUrls: ['./partner-resource.component.scss']
})
export class PartnerResourceComponent implements OnInit {

  @Input() name;
  @Input() resource_id: string;
  @Input() description: string;
  @Input() short_description;
  @Input() logo: string;
  @Input() resource_uri;
  @Input() resource_url;
  
  get description_formatted (){
    return this.description.slice(0, 315).concat('...')
  }

  get logo_src(){
    if(this.logo.startsWith('assets')){
      return this.logo
    }else{
      return new URL(this.logo, environment.ws + '/').toString();
    }
  }

  constructor() {}

  ngOnInit(): void {
    console.log("Logo: ", this.logo)
  }

}
