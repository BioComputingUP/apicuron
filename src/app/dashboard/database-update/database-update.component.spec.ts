import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatabaseUpdateComponent } from './database-update.component';

describe('DatabaseUpdateComponent', () => {
  let component: DatabaseUpdateComponent;
  let fixture: ComponentFixture<DatabaseUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DatabaseUpdateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatabaseUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
