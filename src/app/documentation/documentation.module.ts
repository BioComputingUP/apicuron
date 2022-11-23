import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DocumentationRoutingModule } from './documentation-routing.module';
import { DocumentationComponent } from './documentation.component';
import { MarkdownModule } from 'ngx-markdown';


@NgModule({
  declarations: [
    DocumentationComponent
  ],
  imports: [
    CommonModule,
    DocumentationRoutingModule,
    MarkdownModule.forChild()
  ]
})
export class DocumentationModule { }
