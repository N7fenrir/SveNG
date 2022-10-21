import type {IEdge, INode} from "../types";
import type {IInteractedNodes} from "../types";

class Store {

    public nodes: INode[];
    public edges: IEdge[];
    public current: IInteractedNodes;

    constructor() {
        this.nodes = []
        this.edges = []
        this.current = {
            hoveredNode: undefined,
            selectedNode : undefined,
            hoveredEdge: undefined,
            selectedEdge: undefined
        }
    }

}

export default Store;