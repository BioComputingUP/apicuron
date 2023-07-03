import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsByDateChartComponent } from './reports-by-date-chart.component';

describe('ReportsByDateChartComponent', () => {
  let component: ReportsByDateChartComponent;
  let fixture: ComponentFixture<ReportsByDateChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ReportsByDateChartComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportsByDateChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
