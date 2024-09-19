import { ElementRef, Input } from '@angular/core';
import { Directive } from '@angular/core';

@Directive({
  standalone: true,
  selector: '[tableDate]'
})
export class TableDateDirective {
  constructor(private elementRef: ElementRef) {}

  @Input() date: Date;
}