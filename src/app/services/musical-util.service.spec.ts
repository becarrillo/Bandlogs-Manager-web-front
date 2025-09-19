import { TestBed } from '@angular/core/testing';

import { MusicalUtilService } from './musical-util.service';
import { Pitch } from '../enums/pitch';

describe('MusicalUtilService', () => {
  let service: MusicalUtilService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MusicalUtilService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('stringToPitch method converts a string to a Pitch as requirement expects', () => {
    const pitch = service.stringToPitch('D_SHARP');
    expect(pitch)
      .toBe(Pitch.D_SHARP);
  })
});
