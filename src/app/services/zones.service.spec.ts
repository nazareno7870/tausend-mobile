import { TestBed } from '@angular/core/testing';

import { ZonesService } from './zones.service';

describe('ZonesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ZonesService = TestBed.get(ZonesService);
    expect(service).toBeTruthy();
  });
});
