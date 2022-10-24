import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageTermsComponent } from './manage-terms.component';

describe('ManageTermsComponent', () => {
  let component: ManageTermsComponent;
  let fixture: ComponentFixture<ManageTermsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageTermsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageTermsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
