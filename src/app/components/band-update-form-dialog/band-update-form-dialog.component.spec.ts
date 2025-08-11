import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BandUpdateFormDialogComponent } from './band-update-form-dialog.component';

describe('BandUpdateFormDialogComponent', () => {
  let component: BandUpdateFormDialogComponent;
  let fixture: ComponentFixture<BandUpdateFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BandUpdateFormDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BandUpdateFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
