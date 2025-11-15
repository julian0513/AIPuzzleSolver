package solver;

import model.Move;

import java.util.List;

/**
 * In-memory result of a solver run:
 *  - moves: ordered list of moves from start → goal
 *  - pathStates: optional list of int[9] states along that path (start → goal)
 *  - expandedNodeCount: diagnostic metric (# of expanded nodes)
 */
public class SolveResult {

    private final List<Move> moves;
    private final List<int[]> pathStates;       // may be null if not collected
    private final Integer expandedNodeCount;    // may be null

    public SolveResult(List<Move> moves, List<int[]> pathStates, Integer expandedNodeCount) {
        this.moves = moves;
        this.pathStates = pathStates;
        this.expandedNodeCount = expandedNodeCount;
    }

    public List<Move> getMoves() {
        return moves;
    }

    public List<int[]> getPathStates() {
        return pathStates;
    }

    public Integer getExpandedNodeCount() {
        return expandedNodeCount;
    }
}
