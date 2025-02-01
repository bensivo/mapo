import { TextNode } from '../../models/textnode.interface';
import { Edge } from '../../models/edge.interface';

export interface ClipboardData {
    nodes: TextNode[];
    edges: Edge[];
}