import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvalidationIconComponent } from './invalidation-icon.component';

describe('InvalidationIconComponent', () => {
  let component: InvalidationIconComponent;
  let fixture: ComponentFixture<InvalidationIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvalidationIconComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvalidationIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
