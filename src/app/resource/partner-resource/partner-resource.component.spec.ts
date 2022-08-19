import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerResourceComponent } from './partner-resource.component';

describe('PartnerResourceComponent', () => {
  let component: PartnerResourceComponent;
  let fixture: ComponentFixture<PartnerResourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PartnerResourceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PartnerResourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
