import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrcidButtonComponent } from './orcid-button.component';

describe('OrcidButtonComponent', () => {
  let component: OrcidButtonComponent;
  let fixture: ComponentFixture<OrcidButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrcidButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrcidButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
