import { fabric } from 'fabric';

/**
 * Factory class for creating Fabric objects
 */
export class FabricObjectFactory {
    static createIText(text: string, top: number, left: number): fabric.IText {
        const itext = new fabric.IText(text, {
            top: top,
            left: left,
            fontSize: 16,
            fontFamily: 'Roboto',
            backgroundColor: 'white',
        });

        return itext;
    }

    static createTextNode(id: string, text: string, top: number, left: number): fabric.Object {
        const textObj = new fabric.Text(text, {
            top: top,
            left: left,
            fontSize: 16,
            fontFamily: 'Roboto',
        });

        const boundingRect = textObj.getBoundingRect(true);

        const padding = 10;
        const rectTop = boundingRect.top - padding;
        const rectLeft = boundingRect.left - padding;
        const width = boundingRect.width + padding * 2;
        const height = boundingRect.height + padding * 2;

        const rect = new fabric.Rect({
            top: rectTop,
            left: rectLeft,
            width,
            height,
            fill: 'white',
            rx: 10,
            ry: 10,
            stroke: 'black',
            strokeWidth: 1,
            hasControls: false,
        });

        // Create a group and add it to the canvas
        const group = new fabric.Group([rect, textObj], {
            hasControls: false,
            data: {
                id: id,
                type: 'text-node',
            },
        });

        return group;
    }
}