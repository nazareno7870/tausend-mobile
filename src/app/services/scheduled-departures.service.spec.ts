import { TestBed } from '@angular/core/testing';

import { ScheduledDeparturesService } from './scheduled-departures.service';

describe('ScheduledDeparturesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ScheduledDeparturesService = TestBed.get(ScheduledDeparturesService);
    expect(service).toBeTruthy();
  });
});
