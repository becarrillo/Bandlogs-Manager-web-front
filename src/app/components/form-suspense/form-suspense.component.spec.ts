import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormSuspenseComponent } from './form-suspense.component';

describe('FormSuspenseComponent', () => {
  let component: FormSuspenseComponent;
  let fixture: ComponentFixture<FormSuspenseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormSuspenseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormSuspenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
