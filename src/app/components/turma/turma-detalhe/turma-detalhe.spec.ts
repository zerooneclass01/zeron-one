import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TurmaDetalhe } from './turma-detalhe';

describe('TurmaDetalhe', () => {
  let component: TurmaDetalhe;
  let fixture: ComponentFixture<TurmaDetalhe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TurmaDetalhe],
    }).compileComponents();

    fixture = TestBed.createComponent(TurmaDetalhe);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
