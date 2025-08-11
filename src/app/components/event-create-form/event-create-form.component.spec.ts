import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventCreateFormComponent } from './event-create-form.component';

describe('EventCreateFormComponent', () => {
  let component: EventCreateFormComponent;
  let fixture: ComponentFixture<EventCreateFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventCreateFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventCreateFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
