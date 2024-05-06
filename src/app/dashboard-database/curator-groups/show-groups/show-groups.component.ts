import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { GroupsService } from '../services/groups.service';

@Component({
  selector: 'show-groups',
  templateUrl: './show-groups.component.html',
  styleUrls: ['./show-groups.component.scss']
})
export class ShowGroupsComponent implements OnInit {

  groups$: Observable<any[]>;

  constructor(private groupsService: GroupsService) {}

  ngOnInit(): void {
    this.groups$ = this.groupsService.getGroups();
  }

  selectGroup(name: string) {
    this.groupsService.selectGroup(name);
  }
}
