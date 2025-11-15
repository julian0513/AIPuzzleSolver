// src/main/java/com/example/puzzle/dto/SolveResponse.java
package dto;

import java.util.List;

/**
 * Response payload for /api/puzzle/solve.
 *
 * Fields:
 *  - moves: ordered list of legal moves from the start state to the goal (e.g., "L","U","R","D").
 *  - solveTimeMs: server-side time taken to compute the solution (milliseconds).
 *  - expandedNodeCount: number of states expanded during the search (useful for comparing algorithms).
 *  - pathStates: optional list of intermediate board states (int[9]) along the returned path (start → goal).
 */
public class SolveResponse {

    /** Ordered sequence of moves that transform the start state into the goal state. */
    private List<String> moves;

    /** Wall-clock time spent solving on the server, in milliseconds. */
    private long solveTimeMs;

    /** Number of nodes expanded while searching (may be null if not collected). */
    private Integer expandedNodeCount;

    /** Optional list of intermediate states corresponding to the returned path (start → goal). */
    private List<int[]> pathStates;

    /** No-args constructor for JSON serialization/deserialization. */
    public SolveResponse() {}

    /** Convenience constructor. */
    public SolveResponse(List<String> moves, long solveTimeMs, Integer expandedNodeCount, List<int[]> pathStates) {
        this.moves = moves;
        this.solveTimeMs = solveTimeMs;
        this.expandedNodeCount = expandedNodeCount;
        this.pathStates = pathStates;
    }

    // Getters / Setters

    public List<String> getMoves() {
        return moves;
    }

    public void setMoves(List<String> moves) {
        this.moves = moves;
    }

    public long getSolveTimeMs() {
        return solveTimeMs;
    }

    public void setSolveTimeMs(long solveTimeMs) {
        this.solveTimeMs = solveTimeMs;
    }

    public Integer getExpandedNodeCount() {
        return expandedNodeCount;
    }

    public void setExpandedNodeCount(Integer expandedNodeCount) {
        this.expandedNodeCount = expandedNodeCount;
    }

    public List<int[]> getPathStates() {
        return pathStates;
    }

    public void setPathStates(List<int[]> pathStates) {
        this.pathStates = pathStates;
    }

    @Override
    public String toString() {
        return "SolveResponse{" +
                "moves=" + (moves == null ? null : moves.toString()) +
                ", solveTimeMs=" + solveTimeMs +
                ", expandedNodeCount=" + expandedNodeCount +
                ", pathStates=" + (pathStates == null ? null : ("count=" + pathStates.size())) +
                '}';
    }
}
