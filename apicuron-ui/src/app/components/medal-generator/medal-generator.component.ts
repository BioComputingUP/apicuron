import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MedalGeneratorService } from '../../dashboard-database/services/medal-generator.service';

@Component({
  selector: 'app-medal-generator',
  templateUrl: './medal-generator.component.html',
  styleUrls: ['./medal-generator.component.scss']
})
export class MedalGeneratorComponent implements OnInit {
  number = '10';
  color = '#000000';
  fontSize = '50';
  generatedSVG!: SafeHtml;

  constructor(
    private medalService: MedalGeneratorService,
    private sanitizer: DomSanitizer
  ) {}

  async ngOnInit() {
    await this.medalService.initialize();
    this.updateMedal();
  }

  updateMedal() {
    const svgString = this.medalService.generateMedal(this.number, {
      color: this.color,
      fontSize: this.fontSize
    });

    this.generatedSVG = this.sanitizer.bypassSecurityTrustHtml(svgString);
  }

  downloadMedal() {
		// Convert SafeHtml to string first
		const svgString = this.generatedSVG.toString();
		const blob = new Blob([svgString], { type: 'image/svg+xml' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `medal-${this.number}.svg`;
		a.click();
	}
}