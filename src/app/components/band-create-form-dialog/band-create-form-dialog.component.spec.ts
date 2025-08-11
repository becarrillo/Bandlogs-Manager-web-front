import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BandCreateFormDialogComponent } from './band-create-form-dialog.component';

describe('BandCreateFormDialogComponent', () => {
  let component: BandCreateFormDialogComponent;
  let fixture: ComponentFixture<BandCreateFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BandCreateFormDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BandCreateFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
