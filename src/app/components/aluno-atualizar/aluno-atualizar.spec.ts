import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlunoAtualizar } from './aluno-atualizar';

describe('AlunoAtualizar', () => {
  let component: AlunoAtualizar;
  let fixture: ComponentFixture<AlunoAtualizar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlunoAtualizar],
    }).compileComponents();

    fixture = TestBed.createComponent(AlunoAtualizar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
