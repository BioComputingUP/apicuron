import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityListElementComponent } from './activity-list-element.component';

describe('TermCardComponent', () => {
  let component: ActivityListElementComponent;
  let fixture: ComponentFixture<ActivityListElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ActivityListElementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivityListElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
