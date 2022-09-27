import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { fromEvent } from 'rxjs';
import { DatabasesService } from '../databases/services/databases.service';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit, AfterViewInit {
  database_list: Object;

  search_biocurators_text = ''
  
  // @ViewChild("search_biocurators", { static: false }) search_biocurators_button: ElementRef;

  constructor(protected databaseService: DatabasesService) { }
  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
    this.databaseService.GetResources().subscribe((response) => {
      this.database_list = response['data']
    })
  }

}
