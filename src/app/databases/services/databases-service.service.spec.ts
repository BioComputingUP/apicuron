import { TestBed } from '@angular/core/testing';

import { DatabasesService } from './databases-service.service';

describe('DatabasesServiceService', () => {
  let service: DatabasesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DatabasesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
