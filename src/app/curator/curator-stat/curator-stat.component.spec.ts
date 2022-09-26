import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CuratorStatComponent } from './curator-stat.component';

describe('CuratorStatComponent', () => {
  let component: CuratorStatComponent;
  let fixture: ComponentFixture<CuratorStatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CuratorStatComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CuratorStatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
