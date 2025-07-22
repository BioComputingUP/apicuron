import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerationIconComponent } from './generation-icon.component';

describe('GenerationIconComponent', () => {
  let component: GenerationIconComponent;
  let fixture: ComponentFixture<GenerationIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenerationIconComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerationIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
