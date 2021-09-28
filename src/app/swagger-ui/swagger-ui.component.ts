import {Component, OnInit} from '@angular/core';
import SwaggerUI from 'swagger-ui';


@Component({
  selector: 'app-swagger-ui',
  templateUrl: './swagger-ui.component.html',
  styleUrls: ['./swagger-ui.component.scss']
})
export class SwaggerUiComponent implements OnInit {

  constructor() {
  }

  ngOnInit(): void {
    SwaggerUI({
      domNode: document.getElementById('swagger-ui-item'),
      // url: 'https://petstore.swagger.io/v2/swagger.json'
      // url: 'http://localhost:4200/assets/swagger.json'
      url: '../assets/swagger.json'
    });

  }

}
