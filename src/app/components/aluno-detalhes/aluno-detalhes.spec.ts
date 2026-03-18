import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlunoDetalhes } from './aluno-detalhes';

describe('AlunoDetalhes', () => {
  let component: AlunoDetalhes;
  let fixture: ComponentFixture<AlunoDetalhes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlunoDetalhes],
    }).compileComponents();

    fixture = TestBed.createComponent(AlunoDetalhes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
