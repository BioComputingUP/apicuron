import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CuratorsPageComponent } from './curator.component';

describe('CuratorComponent', () => {
  let component: CuratorsPageComponent;
  let fixture: ComponentFixture<CuratorsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CuratorsPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CuratorsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
