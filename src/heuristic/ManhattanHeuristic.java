package heuristic;

import model.PuzzleState;
import org.springframework.stereotype.Component;

/**
 * Manhattan-distance heuristic for the 8-puzzle.
 *
 * Definition:
 *  - For each tile 1..8, add the Manhattan distance between its current (row, col)
 *    and its goal (row, col); ignore the blank (0).
 *  - Admissible (never overestimates) and consistent for unit-cost moves,
 *    so A* with this heuristic is optimal and efficient.
 */
@Component
public class ManhattanHeuristic implements Heuristic {

    /**
     * Estimate remaining moves to the goal by summing |Δrow| + |Δcol| for tiles 1..8.
     *
     * @param state non-null 3×3 puzzle state
     * @return non-negative heuristic value (0 for the goal state)
     * @throws IllegalArgumentException if state is null
     */
    @Override
    public int estimate(PuzzleState state) {
        if (state == null) {
            throw new IllegalArgumentException("state cannot be null.");
        }

        int[] tiles = state.toArray(); // defensive copy from immutable value object
        int totalManhattan = 0;

        for (int index = 0; index < tiles.length; index++) {
            int tileValue = tiles[index];
            if (tileValue == 0) {
                continue; // skip the blank
            }

            // Current (row, col) for this tile.
            int currentRow = index / 3;
            int currentCol = index % 3;

            // Goal (row, col) for this tile value (1..8) in the canonical goal [1..8, 0].
            int goalIndex = tileValue - 1;
            int goalRow = goalIndex / 3;
            int goalCol = goalIndex % 3;

            // |Δrow| + |Δcol|
            totalManhattan += Math.abs(currentRow - goalRow) + Math.abs(currentCol - goalCol);
        }

        return totalManhattan;
    }
}
