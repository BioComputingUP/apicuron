import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "svg-revision-icon",
  template: `
    <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" [ngClass]="ngClass" viewBox="0 0 57 57">
      <!-- <path fill="#E5E5E5" d="M0 0h57v57H0z" />
      <path fill="#EEE" d="M-396-724H884V718H-396z" />
      <path fill="#fff" d="M-351-102H836v597H-351z" /> -->
      <g filter="url(#a)">
        <rect x="-34" y="-27" width="259" height="111" rx="5" fill="#fff" />
      </g>
      <circle cx="28.5" cy="28.5" r="28.5" [attr.fill]="background_color" />
      <path
        d="m45.333 16.662-4.032-4.016c-.861-.86-2.364-.862-3.229 0L15.458 35.267a2.05 2.05 0 0 0-.449.685l-2.864 7.306c-.296.756-.135 1.596.456 2.154a1.976 1.976 0 0 0 2.166.437l7.27-2.904c.255-.102.482-.251.68-.446l22.618-22.624a2.271 2.271 0 0 0-.002-3.213Zm-31.352 27.31 2.455-6.25 3.73 3.843-6.185 2.407ZM43.937 18.49 21.907 40.53 17.507 36l21.96-21.969c.161-.149.36-.079.438 0l4.033 4.017a.31.31 0 0 1 0 .44Z"
        [attr.fill]="accent_color"
      />
      <defs>
        <filter
          id="a"
          x="-38"
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
export class RevisionIconComponent implements OnInit {
  constructor() {}
  @Input()
  accent_color = '#5A1001';

  @Input()
  background_color= '#CCC';

  @Input()
  ngClass: any;
  
  ngOnInit(): void {}
}
