import { NgModule, SecurityContext } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DocumentationRoutingModule } from './documentation-routing.module';
import { DocumentationComponent } from './documentation.component';
import { MarkdownModule } from 'ngx-markdown';
import { HttpClient } from '@angular/common/http';


@NgModule({
  declarations: [
    DocumentationComponent
  ],
  imports: [
    CommonModule,
    DocumentationRoutingModule,
    MarkdownModule.forRoot({ 
      loader: HttpClient, 
      sanitize: SecurityContext.NONE
    })
  ]
})
export class DocumentationModule { }
