import { TestBed } from '@angular/core/testing';

import { CuratorPageService } from './curator-page.service';

describe('CuratorPageService', () => {
  let service: CuratorPageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CuratorPageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
