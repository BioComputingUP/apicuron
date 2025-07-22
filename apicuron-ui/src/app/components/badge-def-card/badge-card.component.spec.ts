import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BadgeDefCardComponent } from './badge-def-card.component';

describe('BadgeCardComponent', () => {
  let component: BadgeDefCardComponent;
  let fixture: ComponentFixture<BadgeDefCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ BadgeDefCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BadgeDefCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
