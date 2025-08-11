import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoggedInUserMenuComponent } from './logged-in-user-menu.component';

describe('UserMenuComponent', () => {
  let component: LoggedInUserMenuComponent;
  let fixture: ComponentFixture<LoggedInUserMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoggedInUserMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoggedInUserMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
