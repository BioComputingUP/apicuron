import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-categories-pie-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './categories-pie-chart.component.html',
  styleUrls: ['./categories-pie-chart.component.scss']
})
export class CategoriesPieChartComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
