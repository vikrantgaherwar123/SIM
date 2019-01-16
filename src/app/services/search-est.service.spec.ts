import { TestBed, inject } from '@angular/core/testing';

import { SearchEstService } from './search-est.service';

describe('SearchEstService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SearchEstService]
    });
  });

  it('should be created', inject([SearchEstService], (service: SearchEstService) => {
    expect(service).toBeTruthy();
  }));
});
