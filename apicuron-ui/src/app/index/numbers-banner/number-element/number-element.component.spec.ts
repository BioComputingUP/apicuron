import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NumberElementComponent } from './number-element.component';

describe('NumberElementComponent', () => {
  let component: NumberElementComponent;
  let fixture: ComponentFixture<NumberElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NumberElementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NumberElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
