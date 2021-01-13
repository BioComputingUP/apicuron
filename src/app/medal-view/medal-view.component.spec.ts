import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedalViewComponent } from './medal-view.component';

describe('MedalViewComponent', () => {
  let component: MedalViewComponent;
  let fixture: ComponentFixture<MedalViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedalViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MedalViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
