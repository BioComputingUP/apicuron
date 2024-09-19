import { BaseCdkCell, CdkCell, CdkTable } from '@angular/cdk/table';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input } from '@angular/core';
import { Directive } from '@angular/core';


@Component({
  standalone: true,
  imports: [CommonModule],
  selector: '.date-cell',
  template: `{{ cell | date: 'yyyy' }} {{ row | json}}`,
})
export class TableDateComponent {

  @Input() cell: Date;
  @Input() row: any;

}

