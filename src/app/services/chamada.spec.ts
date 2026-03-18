import { TestBed } from '@angular/core/testing';

import { Chamada } from './chamada';

describe('Chamada', () => {
  let service: Chamada;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Chamada);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
