import { TestBed, inject } from '@angular/core/testing';

import { TermConditionService } from '../term-condition.service';

describe('TermConditionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TermConditionService]
    });
  });

  it('should be created', inject([TermConditionService], (service: TermConditionService) => {
    expect(service).toBeTruthy();
  }));
});
