import { Directive, OnInit, Input, ElementRef } from "@angular/core";
import { environment } from "../../../../../src/environments/environment";

@Directive({
  standalone: true,
  selector: "img[src]",
})
export class ImageSrcOverrideDirective implements OnInit {
  host: string;
  @Input() src: string;

  constructor(private el: ElementRef) {
    this.host = environment.host;
  }
  ngOnInit(): void {
    this.el.nativeElement.src = this.host + "/" + this.src;
  }
}
