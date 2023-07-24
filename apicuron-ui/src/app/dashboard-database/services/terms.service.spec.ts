import { TestBed } from '@angular/core/testing';

import { TermsService } from './terms.service';

describe('TermsService', () => {
  let service: TermsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TermsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
