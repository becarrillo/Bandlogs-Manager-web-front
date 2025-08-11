import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserUpdateFormDialogComponent } from './user-update-form-dialog.component';

describe('UserUpdateFormDialogComponent', () => {
  let component: UserUpdateFormDialogComponent;
  let fixture: ComponentFixture<UserUpdateFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserUpdateFormDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserUpdateFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
