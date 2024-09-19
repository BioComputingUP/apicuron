import { ElementRef, Input } from '@angular/core';
import { Directive } from '@angular/core';

@Directive({
  standalone: true,
  selector: '[tableScore]'
})
export class TableScoreDirective {
  constructor(private elementRef: ElementRef) {}
  
  @Input() score: number;
}