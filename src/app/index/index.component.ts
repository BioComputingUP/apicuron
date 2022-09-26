import { Component, OnInit } from '@angular/core';
import { DatabasesService } from '../databases/services/databases.service';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {
  database_list: Object;
  

  constructor(protected databaseService: DatabasesService) { }

  ngOnInit(): void {
    this.databaseService.GetResources().subscribe((response) => {
      this.database_list = response['data']
    })
  }

}
