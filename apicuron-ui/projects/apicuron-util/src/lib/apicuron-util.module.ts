import { NgModule } from '@angular/core';
import { ApicuronUtilComponent } from './apicuron-util.component';
import { PaginationComponent } from './pagination/pagination.component';



@NgModule({
  declarations: [
    ApicuronUtilComponent
  ],
  imports: [
    PaginationComponent
  ],
  exports: [
    ApicuronUtilComponent,
    PaginationComponent
  ]
})
export class ApicuronUtilModule { }
