import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "svg-generation-icon",
  template: `
    <svg [ngClass]="ngClass" fill="currentColor" viewBox="0 0 57 57" xmlns="http://www.w3.org/2000/svg">
      <!-- <path fill="#E5E5E5" d="M0 0h57v57H0z" /> -->
      <!-- <path fill="#EEE" d="M-97-724h1280V718H-97z" />
      <path fill="#fff" d="M-52-102h1187v597H-52z" /> -->
      <g filter="url(#a)">
        <rect x="-30" y="-27" width="259" height="111" rx="5" fill="#fff" />
      </g>
      <circle cx="28.5" cy="28.5" r="28.5" [attr.fill]="background_color" />
      <path
        d="M47.078 26.578H30.422V9.922a1.921 1.921 0 1 0-3.844 0v16.656H9.922a1.921 1.921 0 1 0 0 3.844h16.656v16.656a1.921 1.921 0 1 0 3.844 0V30.422h16.656a1.921 1.921 0 1 0 0-3.844Z"
        fill="currentColor" [style]="accent_color_style"
      />
      <defs>
        <filter
          id="a"
          x="-34"
          y="-27"
          width="267"
          height="119"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend
            in2="BackgroundImageFix"
            result="effect1_dropShadow_101_115"
          />
          <feBlend
            in="SourceGraphic"
            in2="effect1_dropShadow_101_115"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  `,
  styles: [],
})
export class GenerationIconComponent implements OnInit {
  constructor() {}

  @Input()
  accent_color = '#5A1001';

  @Input()
  background_color= '#CCC';

  get accent_color_style (){
    return { color: this.accent_color }
  }

  @Input()
  ngClass: any;

  ngOnInit(): void {}
}
