import type {INode} from "../types";
import type {IInteractedNodes} from "../types";

class Store {

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

export default Store;