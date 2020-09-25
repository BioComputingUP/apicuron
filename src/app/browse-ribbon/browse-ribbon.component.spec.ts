import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowseRibbonComponent } from './browse-ribbon.component';

describe('BrowseRibbonComponent', () => {
  let component: BrowseRibbonComponent;
  let fixture: ComponentFixture<BrowseRibbonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BrowseRibbonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BrowseRibbonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
