import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BadgeIconComponent } from './badge-icon.component';

describe('BadgeIconComponent', () => {
  let component: BadgeIconComponent;
  let fixture: ComponentFixture<BadgeIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BadgeIconComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BadgeIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
