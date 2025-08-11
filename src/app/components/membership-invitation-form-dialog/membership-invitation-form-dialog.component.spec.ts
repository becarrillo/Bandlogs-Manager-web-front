import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MembershipInvitationFormDialogComponent } from './membership-invitation-form-dialog.component';

describe('MembershipInvitationFormDialogComponent', () => {
  let component: MembershipInvitationFormDialogComponent;
  let fixture: ComponentFixture<MembershipInvitationFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MembershipInvitationFormDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MembershipInvitationFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
