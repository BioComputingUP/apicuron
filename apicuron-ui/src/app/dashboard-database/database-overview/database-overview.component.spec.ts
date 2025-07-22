import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatabaseOverviewComponent } from './database-overview.component';

describe('DatabaseOverviewComponent', () => {
  let component: DatabaseOverviewComponent;
  let fixture: ComponentFixture<DatabaseOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DatabaseOverviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatabaseOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
