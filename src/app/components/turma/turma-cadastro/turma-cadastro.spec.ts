import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TurmaCadastro } from './turma-cadastro';

describe('TurmaCadastro', () => {
  let component: TurmaCadastro;
  let fixture: ComponentFixture<TurmaCadastro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TurmaCadastro],
    }).compileComponents();

    fixture = TestBed.createComponent(TurmaCadastro);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
