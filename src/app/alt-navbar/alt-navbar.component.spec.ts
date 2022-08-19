import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AltNavbarComponent } from './alt-navbar.component';

describe('AltNavbarComponent', () => {
  let component: AltNavbarComponent;
  let fixture: ComponentFixture<AltNavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AltNavbarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AltNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
