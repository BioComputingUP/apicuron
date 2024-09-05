import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyGroupsComponent } from './modify-groups.component';

describe('ModifyGroupsComponent', () => {
  let component: ModifyGroupsComponent;
  let fixture: ComponentFixture<ModifyGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModifyGroupsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModifyGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
