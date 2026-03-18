import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlunoComponent } from './aluno';

describe('Aluno', () => {
  let component: AlunoComponent;
  let fixture: ComponentFixture<AlunoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlunoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AlunoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
