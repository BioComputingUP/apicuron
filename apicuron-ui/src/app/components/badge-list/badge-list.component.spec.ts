import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BadgeListComponent } from './badge-list.component';

describe('BadgeListComponent', () => {
  let component: BadgeListComponent;
  let fixture: ComponentFixture<BadgeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ BadgeListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BadgeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
