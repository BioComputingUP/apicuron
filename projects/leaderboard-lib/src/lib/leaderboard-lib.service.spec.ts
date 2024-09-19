import { TestBed } from '@angular/core/testing';

import { LeaderboardLibService } from './leaderboard-lib.service';

describe('LeaderboardLibService', () => {
  let service: LeaderboardLibService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LeaderboardLibService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
