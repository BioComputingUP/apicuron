import { ElementRef, Input } from '@angular/core';
import { Directive } from '@angular/core';

@Directive({
  standalone: true,
  selector: '[tableString]',
})
export class TableStringDirective {
  constructor(private elementRef: ElementRef) {}
  
  @Input() string: string;
}