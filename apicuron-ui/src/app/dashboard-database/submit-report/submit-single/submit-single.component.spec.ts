import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitSingleComponent } from './submit-single.component';

describe('SubmitSingleComponent', () => {
  let component: SubmitSingleComponent;
  let fixture: ComponentFixture<SubmitSingleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubmitSingleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmitSingleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
