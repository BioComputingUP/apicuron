import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitBulkComponent } from './submit-bulk.component';

describe('SubmitBulkComponent', () => {
  let component: SubmitBulkComponent;
  let fixture: ComponentFixture<SubmitBulkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubmitBulkComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmitBulkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
