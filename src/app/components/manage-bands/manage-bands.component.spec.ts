import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageBandsComponent } from './manage-bands.component';

describe('ManageBandsComponent', () => {
  let component: ManageBandsComponent;
  let fixture: ComponentFixture<ManageBandsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageBandsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageBandsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
