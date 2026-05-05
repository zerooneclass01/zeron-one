import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentIdCard } from './student-id-card';

describe('StudentIdCard', () => {
  let component: StudentIdCard;
  let fixture: ComponentFixture<StudentIdCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentIdCard],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentIdCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
