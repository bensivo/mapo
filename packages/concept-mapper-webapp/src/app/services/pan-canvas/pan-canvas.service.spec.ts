import { TestBed } from '@angular/core/testing';

import { PanCanvasService } from './pan-canvas.service';

describe('PanCanvasService', () => {
  let service: PanCanvasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PanCanvasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
