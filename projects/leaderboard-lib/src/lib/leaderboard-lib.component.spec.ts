import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaderboardLibComponent } from './leaderboard-lib.component';

describe('LeaderboardLibComponent', () => {
  let component: LeaderboardLibComponent;
  let fixture: ComponentFixture<LeaderboardLibComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeaderboardLibComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaderboardLibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
