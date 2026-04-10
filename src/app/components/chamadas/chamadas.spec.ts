import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Chamadas } from './chamadas';

describe('Chamadas', () => {
  let component: Chamadas;
  let fixture: ComponentFixture<Chamadas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Chamadas],
    }).compileComponents();

    fixture = TestBed.createComponent(Chamadas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
