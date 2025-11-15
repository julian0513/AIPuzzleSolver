package solver;

import model.PuzzleState;

/**
 * Strategy interface for 8-puzzle solvers.
 *
 * Implementations (A*, BFS, DFS) take a valid, solvable {@link PuzzleState} start state and
 * return a {@link SolveResult} containing the move sequence to the goal (and optional metrics).
 *
 * Contract:
 *  - The caller is responsible for validating shape/contents and solvability before invoking solve().
 *  - Implementations should be deterministic for a given start state (no randomness in search).
 *  - The returned SolveResult must include a legal move list from start → goal; "expanded" and
 *    "pathStates" are optional but recommended for analysis/UX.
 */
public interface Solver {

    /**
     * Compute a solution path from the provided start state to the canonical goal [1,2,3; 4,5,6; 7,8,0].
     *
     * @param startState a valid and solvable 3×3 board
     * @return a SolveResult containing the move list and optional diagnostics
     * @throws IllegalArgumentException if startState is null
     */
    SolveResult solve(PuzzleState startState);
}
