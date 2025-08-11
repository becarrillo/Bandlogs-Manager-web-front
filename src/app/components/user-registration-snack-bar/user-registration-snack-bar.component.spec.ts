import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserRegistrationSnackBarComponent } from './user-registration-snack-bar.component';

describe('UserRegistrationSnackBarComponent', () => {
  let component: UserRegistrationSnackBarComponent;
  let fixture: ComponentFixture<UserRegistrationSnackBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserRegistrationSnackBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserRegistrationSnackBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
