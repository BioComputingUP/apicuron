import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProteinsDetailTableComponent } from './proteins-detail-table.component';

describe('ProteinsDetailTableComponent', () => {
  let component: ProteinsDetailTableComponent;
  let fixture: ComponentFixture<ProteinsDetailTableComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProteinsDetailTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProteinsDetailTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
