import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlarmBannerComponent } from './alarm-banner.component';

describe('AlarmBannerComponent', () => {
  let component: AlarmBannerComponent;
  let fixture: ComponentFixture<AlarmBannerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlarmBannerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlarmBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
