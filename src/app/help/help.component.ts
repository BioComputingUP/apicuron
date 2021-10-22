import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class HelpComponent implements OnInit {

  codeWidget = `<apicuron-widget database="disprot"></apicuron-widget>
<script type="text/javascript" src="https://apicuron.org/assets/apicuron-widget.js"></script>`;

  constructor() { }

  ngOnInit() {

  }

scroll(el: HTMLElement) {
    el.scrollIntoView({behavior: 'smooth', block: 'center'});
  }
}
