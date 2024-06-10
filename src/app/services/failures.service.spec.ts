import { TestBed } from '@angular/core/testing';

import { FailuresService } from './failures.service';

describe('FailuresService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FailuresService = TestBed.get(FailuresService);
    expect(service).toBeTruthy();
  });
});
