export interface Edge {
    id: string;

    /**
     * ID of the textnode where the line starts
     */
    startNodeId: string;   

    /**
     * ID of the textnode where the line ends
     */
    endNodeId: string;
}