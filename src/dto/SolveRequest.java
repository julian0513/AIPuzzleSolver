package dto;

import model.Algorithm;

/**
 * Request payload for solving the 8-puzzle from a given start state using a selected algorithm.
 * - startState: flat int[9] board, values 0..8 (0 = blank), row-major order.
 * - selectedAlgorithm: ASTAR, BFS, or DFS (A* uses a heuristic; BFS/DFS do not).
 */
public class SolveRequest {

    /** The 3×3 puzzle state encoded as a flat array [0..8] in row-major order; 0 represents the blank tile. */
    private int[] startState;

    /** The algorithm to use for solving (ASTAR, BFS, DFS). */
    private Algorithm selectedAlgorithm;

    /** No-args constructor for JSON deserialization. */
    public SolveRequest() {}

    /** Convenience constructor for manual construction/tests. */
    public SolveRequest(int[] startState, Algorithm selectedAlgorithm) {
        this.startState = startState;
        this.selectedAlgorithm = selectedAlgorithm;
    }

    // Getters / Setters

    public int[] getStartState() {
        return startState;
    }

    public void setStartState(int[] startState) {
        this.startState = startState;
    }

    public Algorithm getSelectedAlgorithm() {
        return selectedAlgorithm;
    }

    public void setSelectedAlgorithm(Algorithm selectedAlgorithm) {
        this.selectedAlgorithm = selectedAlgorithm;
    }

    @Override
    public String toString() {
        return "SolveRequest{" +
                "startState=" + (startState == null ? null : java.util.Arrays.toString(startState)) +
                ", selectedAlgorithm=" + selectedAlgorithm +
                '}';
    }
}
