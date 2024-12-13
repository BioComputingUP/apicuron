import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject } from '@angular/core';
import { User } from 'src/app/models/User.model';

@Component({
  selector: 'app-first-popup',
  templateUrl: './first-popup.component.html',
  
})
export class FirstPopupComponent {
  
  constructor(public dialogRef: DialogRef, @Inject(DIALOG_DATA) public data: User) { }

  handleClose(){
    

    this.dialogRef.close();
  }
}
