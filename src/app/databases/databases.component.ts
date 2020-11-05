import {Component, OnInit} from '@angular/core';
import {InternalService} from '../services/internal.service';

@Component({
  selector: 'app-databases',
  templateUrl: './databases.component.html',
  styleUrls: ['./databases.component.scss']
})
export class DatabasesComponent implements OnInit {
  listResourcesDescriptions;

  constructor(private internalService: InternalService) {
  }

  ngOnInit(): void {
    this.internalService.GetResearces().subscribe(data => {
      this.listResourcesDescriptions = data;
    }, (err) => {
    }, () => {
    });
  }

}
