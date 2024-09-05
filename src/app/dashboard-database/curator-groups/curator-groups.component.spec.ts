import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CuratorGroupsComponent } from './curator-groups.component';

describe('CuratorGroupsComponent', () => {
  let component: CuratorGroupsComponent;
  let fixture: ComponentFixture<CuratorGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CuratorGroupsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CuratorGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
