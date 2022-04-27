import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PubmedDetailTableComponent } from './pubmed-detail-table.component';

describe('PubmedDetailTableComponent', () => {
  let component: PubmedDetailTableComponent;
  let fixture: ComponentFixture<PubmedDetailTableComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PubmedDetailTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PubmedDetailTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
