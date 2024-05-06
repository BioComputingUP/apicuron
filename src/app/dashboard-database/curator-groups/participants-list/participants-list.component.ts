import { Component, Input, OnInit } from '@angular/core';
import { GroupsService } from '../services/groups.service';
import { Observable } from 'rxjs';
import { User } from 'src/app/models/User.model';

@Component({
  selector: 'participants-list',
  templateUrl: './participants-list.component.html',
  styleUrls: ['./participants-list.component.scss']
})
export class ParticipantsListComponent implements OnInit {

  constructor(private groups: GroupsService) {}

  // @Input() participant: User

  participants$: Observable<any[]>

  ngOnInit(): void {
    this.participants$ = this.groups.getParticipants();
    // this.participants$ = this.participant.displayedName;
  }
}