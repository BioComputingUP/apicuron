import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MedalGeneratorService {
  private baseSVG: string = ''; // Will load from assets

  async initialize() {
    // Load base SVG from assets
    const response = await fetch('/assets/medals/base-medal.svg');
    this.baseSVG = await response.text();
  }

  generateMedal(number: string, options?: {
    color?: string,
    fontSize?: string
  }): string {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(this.baseSVG, 'image/svg+xml');

    const numberElement = svgDoc.querySelector('[data-number-placeholder]');
    if (numberElement) {
      numberElement.textContent = number;
      if (options?.color) numberElement.setAttribute('fill', options.color);
      if (options?.fontSize) numberElement.setAttribute('font-size', options.fontSize);
    }

    return new XMLSerializer().serializeToString(svgDoc.documentElement);
  }
}