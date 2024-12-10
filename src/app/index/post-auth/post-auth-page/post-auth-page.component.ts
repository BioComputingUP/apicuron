import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-post-auth-page',
  templateUrl: './post-auth-page.component.html',
  styleUrls: ['./post-auth-page.component.scss']
})
export class PostAuthPageComponent {
  checkboxValue = false;

  constructor(protected router: Router) { }
  goToHome() {
    this.router.navigate(['/']).then(success => {
      if (!success) {
        console.log('Error navigating to home page');
      }
    });
  }
}
