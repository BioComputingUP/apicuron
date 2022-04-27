import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DashboardUserformComponent } from './dashboard-userform.component';

describe('DashboardUserformComponent', () => {
  let component: DashboardUserformComponent;
  let fixture: ComponentFixture<DashboardUserformComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardUserformComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardUserformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
