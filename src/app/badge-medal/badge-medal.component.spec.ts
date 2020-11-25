import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BadgeMedalComponent } from './badge-medal.component';

describe('BadgeMedalComponent', () => {
  let component: BadgeMedalComponent;
  let fixture: ComponentFixture<BadgeMedalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BadgeMedalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BadgeMedalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
