import { TestBed } from '@angular/core/testing';
import { fabric } from 'fabric';
import { Subject } from 'rxjs';
import { TextNode } from '../../models/textnode.model';
import { TextNodeStore } from '../../store/text-node.store';
import { Tool, ToolbarStore } from '../../store/toolbar.store';
import { FabricUtils } from '../../utils/fabric-utils';
import { CanvasService } from '../canvas/canvas.service';
import { TextNodeService } from './text-node.service';

describe('TextNodeService', () => {
  const mockCanvasService = jasmine.createSpyObj('CanvasService', [], {
    canvasInitialized$: new Subject<fabric.Canvas>(),
    canvasDestroyed$: new Subject<fabric.Canvas>(),
  });
  const mockTextNodeStore = jasmine.createSpyObj('TextNodeStore', ['insert'], {
    textNodes$: new Subject<TextNode[]>(),
  });
  const mockToolbarStore = jasmine.createSpyObj('ToolbarStore', ['setTool']);

  let service: TextNodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TextNodeService,
        { provide: CanvasService, useValue: mockCanvasService },
        { provide: TextNodeStore, useValue: mockTextNodeStore },
        { provide: ToolbarStore, useValue: mockToolbarStore },
      ],
    });

    service = TestBed.inject(TextNodeService);
  });

  describe('renderTextNodes', () => {
    it('should throw an error if there is no canvas', () => {
      expect(() => {
        service.renderTextNodes([]);
      }).toThrowError('No canvas on TextNodeService');
    });

    it('should remove all existing text nodes', () => {
      // Test Objects
      const removeTextNodeSpy = spyOn(FabricUtils, 'removeTextNode');
      const canvas = new fabric.Canvas('');
      const textnodeObj = new fabric.Group([
        new fabric.Text(''),
        new fabric.Rect(),
      ]);

      // Given there is a canvas
      mockCanvasService.canvasInitialized$.next(canvas);

      // Given there is an existing text node
      spyOn(FabricUtils, 'getTextNodes').and.returnValue([textnodeObj]);

      // When we call render
      service.renderTextNodes([]);

      // Then the node is deleted
      expect(removeTextNodeSpy).toHaveBeenCalledWith(canvas, textnodeObj);
    });

    it('should create new text nodes', () => {
      // Test Objects
      const createTextNodeSpy = spyOn(FabricUtils, 'createTextNode');
      const canvas = new fabric.Canvas('');
      const textnode1: TextNode = {
        id: '1',
        text: 'Hello',
        x: 0,
        y: 0,
        isComment: false,
      };
      const textnode2: TextNode = {
        id: '2',
        text: 'Hello',
        x: 0,
        y: 0,
        isComment: false,
      };

      // Given there is a canvas
      mockCanvasService.canvasInitialized$.next(canvas);

      // When we call render
      service.renderTextNodes([textnode1, textnode2]);

      // Then the nodes are created
      expect(createTextNodeSpy).toHaveBeenCalledWith(canvas, textnode1);
      expect(createTextNodeSpy).toHaveBeenCalledWith(canvas, textnode2);
    });
  });

  describe('addPendingTextNode', () => {
    it('should throw an error if there is no canvas', () => {
      expect(() => {
        service.addPendingTextNode(0, 0, false);
      }).toThrowError('No canvas on TextNodeService');
    });

    it('should add a pending text node at the given position', () => {
      // Test Objects
      const createITextSpy = spyOn(FabricUtils, 'createIText');
      const selectITextSpy = spyOn(FabricUtils, 'selectIText');
      const canvas = new fabric.Canvas('');

      // Given there is a canvas
      mockCanvasService.canvasInitialized$.next(canvas);

      // When we call addPendingTextNode
      service.addPendingTextNode(0, 0, false);

      // Then an itext is created
      expect(createITextSpy).toHaveBeenCalledWith(canvas, '', 0, 0);

      // Then the itext is selected
      expect(selectITextSpy).toHaveBeenCalled();
    });
  });

  describe('finalizeTextNode', () => {
    it('should throw an error if there is no canvas', () => {
      expect(() => {
        service.finalizeTextNode(new fabric.IText(''));
      }).toThrowError('No canvas on TextNodeService');
    });

    it('should remove the itext from the canvas', () => {
      const canvas = jasmine.createSpyObj('fabric.Canvas', ['remove']);

      // Given there is a canvas
      mockCanvasService.canvasInitialized$.next(canvas);

      // When we call finalizeTextNode
      service.finalizeTextNode(
        new fabric.IText('asdf', {
          left: 0,
          top: 0,
        }),
      );

      // Then the itext is removed
      expect(canvas.remove).toHaveBeenCalled();
    });

    it('should add a new textnode to the store', () => {
      const canvas = jasmine.createSpyObj('fabric.Canvas', ['remove']);

      // Given there is a canvas
      mockCanvasService.canvasInitialized$.next(canvas);

      // When we call finalizeTextNode
      service.finalizeTextNode(
        new fabric.IText('asdf', {
          left: 0,
          top: 0,
        }),
      );

      // Then a new node is added to the store
      expect(mockTextNodeStore.insert).toHaveBeenCalledWith(
        jasmine.objectContaining({
          id: jasmine.any(String),
          text: 'asdf',
          x: 0,
          y: 0,
        }),
      );
    });

    it('should toolbar to pointer', () => {
      const canvas = jasmine.createSpyObj('fabric.Canvas', ['remove']);

      // Given there is a canvas
      mockCanvasService.canvasInitialized$.next(canvas);

      // When we call finalizeTextNode
      service.finalizeTextNode(
        new fabric.IText('asdf', {
          left: 0,
          top: 0,
        }),
      );

      // Then tool is set to pointer
      expect(mockToolbarStore.setTool).toHaveBeenCalledWith(Tool.POINTER);
    });
  });

  // TODO: editTextNode Tests
  // TODO: updateTextNode
  // TODO: updateTextNodesFromSelection
});
