package model;

import java.util.Objects;

/**
 * Wraps a {@link PuzzleState} with metadata used by search algorithms:
 *  - parent link for path reconstruction
 *  - moveApplied = the move taken from the parent to reach this state (null for root)
 *  - gCost = path cost so far (number of moves from the start)
 *  - hCost = heuristic estimate to goal (A* only; BFS/DFS set this to 0)
 *  - fCost = gCost + hCost (A* priority)
 *
 * Notes:
 *  - Comparable<SearchNode> is implemented for A* priority queues (order by f, then h, then g).
 *  - equals/hashCode are based on the underlying PuzzleState so nodes representing the same board
 *    can be de-duplicated in sets/maps if desired (visited checks typically use the state key).
 */
public final class SearchNode implements Comparable<SearchNode> {

    /** The board configuration for this node. */
    private final PuzzleState state;

    /** Back-pointer to reconstruct the solution path (null for root). */
    private final SearchNode parent;

    /** The move applied at the parent to reach this node (null for root). */
    private final Move moveApplied;

    /** Path cost so far (in 8-puzzle, each move costs 1). */
    private final int gCost;

    /** Heuristic estimate to goal (A*); 0 for uninformed searches (BFS/DFS). */
    private final int hCost;

    /** Total estimated cost used by A* (f = g + h); equals g when h=0. */
    private final int fCost;

    /**
     * Full constructor; prefer the static factories for clarity (forAStar / forUninformed).
     */
    public SearchNode(PuzzleState state,
                      SearchNode parent,
                      Move moveApplied,
                      int gCost,
                      int hCost) {
        this.state = Objects.requireNonNull(state, "state");
        this.parent = parent;                 // may be null for root
        this.moveApplied = moveApplied;       // may be null for root
        this.gCost = gCost;
        this.hCost = hCost;
        this.fCost = gCost + hCost;
    }

    /**
     * Factory for A* nodes (provide g and h; f is computed as g + h).
     */
    public static SearchNode forAStar(PuzzleState state,
                                      SearchNode parent,
                                      Move moveApplied,
                                      int gCost,
                                      int hCost) {
        return new SearchNode(state, parent, moveApplied, gCost, hCost);
    }

    /**
     * Factory for uninformed searches (BFS/DFS): h is set to 0.
     */
    public static SearchNode forUninformed(PuzzleState state,
                                           SearchNode parent,
                                           Move moveApplied,
                                           int gCost) {
        return new SearchNode(state, parent, moveApplied, gCost, 0);
    }

    // -------------------- Accessors --------------------

    public PuzzleState getState() {
        return state;
    }

    public SearchNode getParent() {
        return parent;
    }

    public Move getMoveApplied() {
        return moveApplied;
    }

    public int getGCost() {
        return gCost;
    }

    public int getHCost() {
        return hCost;
    }

    public int getFCost() {
        return fCost;
    }

    // -------------------- Ordering for A* PQ --------------------

    /**
     * Natural ordering for A*: lower f wins; ties broken by lower h, then lower g.
     * (Tie-breaks help prioritize nodes closer to the goal and shallower paths.)
     */
    @Override
    public int compareTo(SearchNode other) {
        if (this.fCost != other.fCost) {
            return Integer.compare(this.fCost, other.fCost);
        }
        if (this.hCost != other.hCost) {
            return Integer.compare(this.hCost, other.hCost);
        }
        return Integer.compare(this.gCost, other.gCost);
    }

    // -------------------- Value semantics --------------------

    /**
     * Nodes are considered equal if they represent the same board state.
     * (This is convenient when using sets/maps keyed by nodes; most algorithms
     *   still maintain a separate visited set keyed by the underlying state.)
     */
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof SearchNode)) return false;
        SearchNode that = (SearchNode) o;
        return this.state.equals(that.state);
    }

    @Override
    public int hashCode() {
        return state.hashCode();
    }

    @Override
    public String toString() {
        return "SearchNode{" +
                "state=" + state +
                ", g=" + gCost +
                ", h=" + hCost +
                ", f=" + fCost +
                ", move=" + (moveApplied == null ? "ROOT" : moveApplied.getShortCode()) +
                '}';
    }
}
