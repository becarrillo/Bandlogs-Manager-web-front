import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BandViewComponent } from './band-view.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

describe('BandViewComponent', () => {
  let component: BandViewComponent;
  let fixture: ComponentFixture<BandViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BandViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BandViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
