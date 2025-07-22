import { TestBed } from '@angular/core/testing';

import { ApicuronUtilService } from './apicuron-util.service';

describe('ApicuronUtilService', () => {
  let service: ApicuronUtilService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApicuronUtilService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
