import { Component, EventEmitter, Input, Output } from '@angular/core';
import { User } from 'src/app/models/User.model';

@Component({
  standalone: true,
  selector: 'first-login-popup',
  templateUrl: './first-login-popup.component.html',
})
export class FirstLoginPopupComponent {
  @Input() user!: User;
  @Output() $click = new EventEmitter<User>();
  newUserInfo: User;
  public click(): void {
    this.$click.emit(this.newUserInfo);
  }
}
