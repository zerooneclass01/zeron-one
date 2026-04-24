import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinanceiroDespesa } from './financeiro-despesa';

describe('FinanceiroDespesa', () => {
  let component: FinanceiroDespesa;
  let fixture: ComponentFixture<FinanceiroDespesa>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinanceiroDespesa],
    }).compileComponents();

    fixture = TestBed.createComponent(FinanceiroDespesa);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
