import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageAchievementsComponent } from './manage-achievements.component';

describe('ManageAchievementsComponent', () => {
  let component: ManageAchievementsComponent;
  let fixture: ComponentFixture<ManageAchievementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageAchievementsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageAchievementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
