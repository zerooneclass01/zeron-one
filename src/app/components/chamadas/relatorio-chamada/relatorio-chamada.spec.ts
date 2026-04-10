import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelatorioChamada } from './relatorio-chamada';

describe('RelatorioChamada', () => {
  let component: RelatorioChamada;
  let fixture: ComponentFixture<RelatorioChamada>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelatorioChamada],
    }).compileComponents();

    fixture = TestBed.createComponent(RelatorioChamada);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
