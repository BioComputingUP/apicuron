import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NumbersBannerComponent } from './numbers-banner.component';

describe('NumbersBannerComponent', () => {
  let component: NumbersBannerComponent;
  let fixture: ComponentFixture<NumbersBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NumbersBannerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NumbersBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
