import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChamadaPrint } from './chamada-print';

describe('ChamadaPrint', () => {
  let component: ChamadaPrint;
  let fixture: ComponentFixture<ChamadaPrint>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChamadaPrint],
    }).compileComponents();

    fixture = TestBed.createComponent(ChamadaPrint);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
