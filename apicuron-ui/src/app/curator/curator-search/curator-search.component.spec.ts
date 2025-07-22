import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CuratorSearchComponent } from './curator-search.component';

describe('CuratorSearchComponent', () => {
  let component: CuratorSearchComponent;
  let fixture: ComponentFixture<CuratorSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CuratorSearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CuratorSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
