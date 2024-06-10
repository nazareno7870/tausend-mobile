import { TestBed } from '@angular/core/testing';

import { ExclusionsService } from './exclusions.service';

describe('ExclusionsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ExclusionsService = TestBed.get(ExclusionsService);
    expect(service).toBeTruthy();
  });
});
