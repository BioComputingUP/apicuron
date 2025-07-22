import { NgModule, SecurityContext } from "@angular/core";
import { CommonModule } from "@angular/common";

import { DocumentationRoutingModule } from "./documentation-routing.module";
import { DocumentationComponent } from "./documentation.component";
import { MarkdownModule } from "ngx-markdown";
import { HttpClient } from "@angular/common/http";
import "../../../node_modules/marked/marked.min.js";
import "../../../node_modules/prismjs/prism.js";
import "../../../node_modules/prismjs/components/prism-json.js";
import "../../../node_modules/prismjs/components/prism-bash.js";
import { NavbarComponent } from "../alt-navbar/alt-navbar.component";
import { FootComponent } from "../foot/foot.component";

@NgModule({
  declarations: [DocumentationComponent],
  imports: [
    CommonModule,
    DocumentationRoutingModule,
    NavbarComponent,
    FootComponent,
    MarkdownModule.forRoot({
      loader: HttpClient,
      sanitize: SecurityContext.NONE,
    }),
  ],
})
export class DocumentationModule {}
