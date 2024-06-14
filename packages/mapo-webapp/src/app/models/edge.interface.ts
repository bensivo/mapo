export interface Edge {
    id: string;

    /**
     * Text for the edge itself, rendered in the middle of the edge
     */
    text?: string;

    /**
     * ID of the textnode where the line starts
     */
    startNodeId: string;   

    /**
     * ID of the textnode where the line ends
     */
    endNodeId: string;
}