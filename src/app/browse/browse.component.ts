import {Component, OnInit} from '@angular/core';
import {concat, BehaviorSubject, combineLatest, of} from 'rxjs';
import {InternalService} from '../services/internal.service';
import {AuthService} from '../services/auth.service';

@Component({
  selector: 'app-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss']
})
export class BrowseComponent implements OnInit {
  loading_finished = false;
  dataOnPage = new BehaviorSubject<any[]>([]);
  displayedColumns = ['entry_id', 'events', 'name'];
  sortKey = new BehaviorSubject<string>('entry_id');
  sortDirection = new BehaviorSubject<string>('asc');

  localAuth = new BehaviorSubject<object>({});


  constructor(public authService: AuthService,
              private internalService: InternalService) {
  }

  ngOnInit() {
    this.authService.loginData.subscribe(authData => {
      if (this.localAuth.value !== authData) {
        this.localAuth.next(authData);
      }
    });

    this.localAuth.subscribe(authData => {
      console.log('authData', authData);

      if (!authData.hasOwnProperty('initial')) {
        this.internalService.GetSearch({
          page_size: 100
        }).subscribe((browseData) => {
          this.dataOnPage.next(browseData);
        }, (err) => {
        }, () => {
          this.loading_finished = true;
          console.log('finish');
        });
        // this.internalService.GetSearch({
        //   page_size: 100
        // }).subscribe((browseData) => {
        //     // console.log(browseData.data);
        //     this.dataOnPage.next(browseData.data);
        //   }, (err) => {
        //   },
        //   () => {
        //     this.loading_finished = true;
        //     console.log('finish');
        //   });
      }
    });

  }

  adjustSort(key: string) {
    if (this.sortKey.value === key) {
      if (this.sortDirection.value === 'asc') {
        this.sortDirection.next('desc');
      } else {
        this.sortDirection.next('asc');
      }
      return;
    }

    this.sortKey.next(key);
    this.sortDirection.next('asc');
  }


}
