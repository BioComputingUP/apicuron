import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PubmedDetailTableComponent } from './pubmed-detail-table.component';

describe('PubmedDetailTableComponent', () => {
  let component: PubmedDetailTableComponent;
  let fixture: ComponentFixture<PubmedDetailTableComponent>;

  beforeEach(async(() => {
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
