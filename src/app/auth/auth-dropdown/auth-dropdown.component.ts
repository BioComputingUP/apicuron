import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth.service';

@Component({
  selector: 'auth-dropdown',
  templateUrl: './auth-dropdown.component.html',
  styleUrls: ['./auth-dropdown.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class AuthDropdownComponent implements OnInit {
  user$: Observable<any>;

  @Input('button-class') button_class = '';
  show_login = false;
  login_link: string;
  loggedIn$: Observable<any>;
  user_has_resource$: Observable<boolean>;

  constructor(protected authService: AuthService, protected toastr: ToastrService) {
    this.login_link = environment.auth_ws + '/auth/orcid'
    this.loggedIn$ = this.authService.loggedIn$
    this.user$ = this.authService.user$
    this.user_has_resource$ = this.user$.pipe(
      map((user) => {
        if(user && user.resources && user.resources.length > 0){
          return true
        }
        return false;
      })
    )
  }

  copy_key(){
    navigator.clipboard.writeText(this.authService.token_value)
    this.toastr.show('API Key Sucessfully copied', 'API KEY', {
      positionClass:'toast-bottom-right'
    })
  }

  logout(){
    this.authService.logout()
  }

  has_a_resource(){
    
  }

  ngOnInit(): void {
  }

}
