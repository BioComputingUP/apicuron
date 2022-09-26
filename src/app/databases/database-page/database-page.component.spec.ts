import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatabasePageComponent } from './database-page.component';

describe('DatabasePageComponent', () => {
  let component: DatabasePageComponent;
  let fixture: ComponentFixture<DatabasePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DatabasePageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DatabasePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
