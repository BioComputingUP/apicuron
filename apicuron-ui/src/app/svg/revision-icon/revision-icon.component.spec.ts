import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevisionIconComponent } from './revision-icon.component';

describe('RevisionIconComponent', () => {
  let component: RevisionIconComponent;
  let fixture: ComponentFixture<RevisionIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RevisionIconComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RevisionIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
