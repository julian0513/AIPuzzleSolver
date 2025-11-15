package heuristic;

import model.PuzzleState;

/**
 * Interface for admissible/consistent cost estimators used by heuristic search (e.g., A*).
 *
 * Contract:
 *  - Implementations return a non-negative integer that estimates the remaining cost
 *    (in moves) from the given state to the goal.
 *  - For A* to be optimally correct, the heuristic should be admissible (never overestimates)
 *    and ideally consistent (triangle inequality holds).
 */
public interface Heuristic {

    /**
     * Estimate the remaining number of moves from {@code state} to the goal configuration.
     *
     * @param state the current puzzle state (non-null)
     * @return a non-negative integer estimate of the distance-to-goal
     */
    int estimate(PuzzleState state);
}
