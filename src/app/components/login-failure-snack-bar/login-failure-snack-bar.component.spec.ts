import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginFailureSnackBarComponent } from './login-failure-snack-bar.component';

describe('LoginFailureSnackBarComponent', () => {
  let component: LoginFailureSnackBarComponent;
  let fixture: ComponentFixture<LoginFailureSnackBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginFailureSnackBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginFailureSnackBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
