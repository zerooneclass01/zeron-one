import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Turma } from './turma';

describe('Turma', () => {
  let component: Turma;
  let fixture: ComponentFixture<Turma>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Turma],
    }).compileComponents();

    fixture = TestBed.createComponent(Turma);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
