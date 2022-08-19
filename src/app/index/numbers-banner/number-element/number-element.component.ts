import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-number-element',
  templateUrl: './number-element.component.html',
  styleUrls: ['./number-element.component.scss']
})
export class NumberElementComponent implements OnInit {

  @Input('text') text = 'Biocurators';
  @Input('count') count = 65;


  get count_text (){
    if(this.count >= 1000){
      return `${this.count / 1000}k`
    }
    return this.count
  }

  constructor() { }

  ngOnInit(): void {
  }

}
