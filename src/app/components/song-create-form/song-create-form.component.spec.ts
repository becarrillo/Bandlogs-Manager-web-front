import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SongCreateFormComponent } from './song-create-form.component';

describe('SongCreateFormDialogComponent', () => {
  let component: SongCreateFormComponent;
  let fixture: ComponentFixture<SongCreateFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SongCreateFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SongCreateFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
