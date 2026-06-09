import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoricoAluno } from './historico-aluno';

describe('HistoricoAluno', () => {
  let component: HistoricoAluno;
  let fixture: ComponentFixture<HistoricoAluno>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoricoAluno],
    }).compileComponents();

    fixture = TestBed.createComponent(HistoricoAluno);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
