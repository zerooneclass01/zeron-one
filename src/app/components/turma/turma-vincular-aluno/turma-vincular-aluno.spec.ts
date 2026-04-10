import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TurmaVincularAluno } from './turma-vincular-aluno';

describe('TurmaVincularAluno', () => {
  let component: TurmaVincularAluno;
  let fixture: ComponentFixture<TurmaVincularAluno>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TurmaVincularAluno],
    }).compileComponents();

    fixture = TestBed.createComponent(TurmaVincularAluno);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
