import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedalIconComponent } from './medal-icon.component';

describe('MedalIconComponent', () => {
  let component: MedalIconComponent;
  let fixture: ComponentFixture<MedalIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedalIconComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MedalIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
