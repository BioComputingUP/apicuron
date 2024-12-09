import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApicuronUtilComponent } from './apicuron-util.component';

describe('ApicuronUtilComponent', () => {
  let component: ApicuronUtilComponent;
  let fixture: ComponentFixture<ApicuronUtilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApicuronUtilComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApicuronUtilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
