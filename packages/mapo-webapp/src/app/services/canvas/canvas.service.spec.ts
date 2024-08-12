import { fabric } from 'fabric';
import FontFaceObserver from 'fontfaceobserver';
import { CanvasService } from './canvas.service';

describe('CanvasService', () => {
  describe('initializeCanvas', () => {
    it('should emit canvasInitialized$', async () => {
      // Given there is a canvas html element
      const mockDocument = {
        getElementById: jasmine.createSpy('getElementById').and.returnValue({}),
      };

      // Given the roboto font loads
      const mockFontFaceObserver = {
        load: jasmine.createSpy('load').and.returnValue(Promise.resolve()),
      }

      const spy = jasmine.createSpy('next');

      // When I call initializeCanvas
      const service = new CanvasService(
        mockDocument as any as Document,
        mockFontFaceObserver as any as FontFaceObserver,
      );
      const subscription = service.canvasInitialized$.subscribe(spy);

      await service.initializeCanvas();

      // Then canvasInitialized$ should have been emitted
      expect(spy).toHaveBeenCalledWith(jasmine.any(fabric.Canvas));

      // Cleanup
      subscription.unsubscribe()
    });
  });

  describe('destroyCanvas', () => {
    it('should emit canvasDestroyed$', async () => {
      // Given the canvas has previously been initialized
      const mockDocument = {
        getElementById: jasmine.createSpy('getElementById').and.returnValue({}),
      };
      const mockFontFaceObserver = {
        load: jasmine.createSpy('load').and.returnValue(Promise.resolve()),
      }
      const service = new CanvasService(
        mockDocument as any as Document,
        mockFontFaceObserver as any as FontFaceObserver,
      );
      await service.initializeCanvas();

      let spy = jasmine.createSpy('next');
      service.canvasDestroyed$.subscribe(spy);

      // When I call destroyCanvas
      service.destroyCanvas();

      // Then it emits
      expect(spy).toHaveBeenCalledWith(jasmine.any(fabric.Canvas));
    });
  });
});

