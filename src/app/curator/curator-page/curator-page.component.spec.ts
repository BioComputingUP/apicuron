import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CuratorPageComponent } from './curator-page.component';

describe('CuratorPageComponent', () => {
  let component: CuratorPageComponent;
  let fixture: ComponentFixture<CuratorPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CuratorPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CuratorPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
