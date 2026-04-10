import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TurmaAtualizar } from './turma-atualizar';

describe('TurmaAtualizar', () => {
  let component: TurmaAtualizar;
  let fixture: ComponentFixture<TurmaAtualizar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TurmaAtualizar],
    }).compileComponents();

    fixture = TestBed.createComponent(TurmaAtualizar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
