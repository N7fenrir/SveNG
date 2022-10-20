import type {INode} from "../types";
import type {IInteractedNodes} from "../types";

class Graph {

    public nodes: INode[];
    public current: IInteractedNodes;

    constructor() {
        this.nodes = []
        this.current = {
            hovered: undefined,
            selected : undefined
        }
    }



}

export default Graph;