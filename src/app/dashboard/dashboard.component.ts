import {Component, OnInit, OnDestroy, TemplateRef} from '@angular/core';
import {BehaviorSubject, combineLatest, concat} from 'rxjs';
import {AuthService} from '../services/auth.service';
import {InternalService} from '../services/internal.service';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {BsModalService, BsModalRef} from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  localAuth = new BehaviorSubject<object>({});
  currentJwtToken = null;
  tokenForUser = new BehaviorSubject<object>({
    username: null
  });
  modalRef: BsModalRef;

  displayedColumns = new BehaviorSubject<string[]>([
    'displayedName',
    'institution',
    'username',
    'role',
    'email',
    'gmail',
    'resources',
    'edit',
  ]);
  currentPage = new BehaviorSubject<object>({
    'page': 1
  });
  pageSize = new BehaviorSubject<number>(10);
  dataOnPage = new BehaviorSubject<any[]>([]);
  searchFormControl = new FormControl();
  sortKey = new BehaviorSubject<string>('disprot_id');
  sortDirection = new BehaviorSubject<string>('asc');


  constructor(private modalService: BsModalService,
              private internalService: InternalService,
              private authService: AuthService) {
  }

  ngOnInit() {
    this.authService.loginData.subscribe(authData => {
      if (this.localAuth.value !== authData) {
        this.localAuth.next(authData);
      }
    });
    this.localAuth.subscribe(authData => {
      if (!authData.hasOwnProperty('initial')) {
        combineLatest(this.searchFormControl.valueChanges, this.sortKey, this.sortDirection)
          .subscribe(([searchTerm, sortKey, sortDirection]) => {
            this.internalService.GetUsersList().subscribe(userlist => {
              this.dataOnPage.next(userlist);
            });
          });

        this.searchFormControl.setValue('');
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

  ngOnDestroy(): void {
    this.localAuth.unsubscribe();
  }

  getPubDisProtGetJwtToken() {
    this.internalService.GetPubDisProtGetJwtToken().subscribe(res => {
      this.currentJwtToken = res.token;
    });
  }

  getApucuronJwtTokenForUser(username) {
    this.internalService.GetApucuronJwtTokenForUser(username).subscribe(res => {
      this.tokenForUser.next(
        { username: username,
          token: res.token}
          );
    });
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(
      template,
      Object.assign({}, { class: 'gray modal-lg' })
    );
  }

  copyJWT(inputElement) {
    const copyElement = document.createElement('span');
    copyElement.appendChild(document.createTextNode(this.currentJwtToken));
    copyElement.id = 'tempCopyToClipboard';
    document.body.append(copyElement);

    const range = document.createRange();
    range.selectNode(copyElement);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);

    document.execCommand('copy');
    window.getSelection().removeAllRanges();
    copyElement.remove();
  }

  copyJWTforUser(inputElement) {
    const copyElement = document.createElement('span');
    copyElement.appendChild(document.createTextNode(inputElement));
    copyElement.id = 'tempCopyToClipboard';
    document.body.append(copyElement);

    const range = document.createRange();
    range.selectNode(copyElement);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);

    document.execCommand('copy');
    window.getSelection().removeAllRanges();
    copyElement.remove();
  }


  mapResources(array) {
    if (array) {
      return array.map(x => x.name).join(', ');

    } else  {
      return '';
    }
  }
}
