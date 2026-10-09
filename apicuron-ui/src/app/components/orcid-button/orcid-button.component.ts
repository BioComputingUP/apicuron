import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-orcid-button',
  standalone: true,
  templateUrl: './orcid-button.component.html',
  host: { class: 'tw-inline-flex tw-shrink-0' },
})
export class OrcidButtonComponent {
  @Input() orcid: string = '';
}
