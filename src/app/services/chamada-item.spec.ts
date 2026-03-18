import { TestBed } from '@angular/core/testing';

import { ChamadaItem } from './chamada-item';

describe('ChamadaItem', () => {
  let service: ChamadaItem;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChamadaItem);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
