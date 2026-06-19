import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoogleDrive } from './google-drive';

describe('GoogleDrive', () => {
  let component: GoogleDrive;
  let fixture: ComponentFixture<GoogleDrive>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoogleDrive],
    }).compileComponents();

    fixture = TestBed.createComponent(GoogleDrive);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
