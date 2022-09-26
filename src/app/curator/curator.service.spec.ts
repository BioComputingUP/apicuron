import { TestBed } from '@angular/core/testing';

import { CuratorService } from './curator.service';

describe('CuratorService', () => {
  let service: CuratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CuratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
