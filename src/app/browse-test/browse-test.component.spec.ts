import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowseTestComponent } from './browse-test.component';

describe('BrowseTestComponent', () => {
  let component: BrowseTestComponent;
  let fixture: ComponentFixture<BrowseTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BrowseTestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BrowseTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
