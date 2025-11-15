package model;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;

/**
 * Immutable representation of a 3×3 8-puzzle board.
 *
 * - Tiles are stored as a flat, row-major int[9] with values 0..8 (0 = blank).
 * - Provides helpers for goal checks and neighbor generation (legal blank moves).
 * - Designed to be used as a value object (stable equals/hashCode for sets/maps).
 *
 * Note: Structural validity (length=9, values 0..8 each once) is verified elsewhere
 * in the validation/solvability layer; this class only enforces length=9 defensively.
 */
public final class PuzzleState {

    /** Flat row-major goal state: [1,2,3,4,5,6,7,8,0]. */
    private static final int[] GOAL_TILES = {1, 2, 3, 4, 5, 6, 7, 8, 0};

    /**
     * Precomputed neighbor indices for the 3×3 grid.
     * For each blank index (0..8), list the indices that can slide into it.
     *
     * Index layout:
     *   0 1 2
     *   3 4 5
     *   6 7 8
     */
    private static final int[][] BLANK_NEIGHBOR_INDICES = new int[][]{
            /* 0 */ {1, 3},
            /* 1 */ {0, 2, 4},
            /* 2 */ {1, 5},
            /* 3 */ {0, 4, 6},
            /* 4 */ {1, 3, 5, 7},
            /* 5 */ {2, 4, 8},
            /* 6 */ {3, 7},
            /* 7 */ {4, 6, 8},
            /* 8 */ {5, 7}
    };

    /** Internal immutable storage for the board tiles. */
    private final int[] tiles;

    /** Cache hashCode because this value object is frequently used in hash sets/maps. */
    private final int cachedHashCode;

    /**
     * Construct an immutable board from a flat int[9] (defensive copy).
     * @param sourceTiles flat row-major array (length must be 9)
     * @throws IllegalArgumentException if array length is not 9
     */
    public PuzzleState(int[] sourceTiles) {
        if (sourceTiles == null || sourceTiles.length != 9) {
            throw new IllegalArgumentException("PuzzleState requires an int[9] array.");
        }
        this.tiles = Arrays.copyOf(sourceTiles, 9);
        this.cachedHashCode = Arrays.hashCode(this.tiles);
    }

    /**
     * @return a defensive copy of the internal tiles (maintains immutability).
     */
    public int[] toArray() {
        return Arrays.copyOf(tiles, tiles.length);
    }

    /**
     * @return true if this state equals the canonical goal state [1..8,0].
     */
    public boolean isGoal() {
        // Fast path: compare to precomputed GOAL_TILES
        return Arrays.equals(this.tiles, GOAL_TILES);
    }

    /**
     * @return index (0..8) of the blank tile (value 0).
     * @throws IllegalStateException if no blank is found (should not happen for valid states)
     */
    public int indexOfBlank() {
        for (int index = 0; index < 9; index++) {
            if (tiles[index] == 0) return index;
        }
        throw new IllegalStateException("Blank tile (0) not found in state.");
    }

    /**
     * Generate all legal neighbor states by sliding one adjacent tile into the blank.
     * Each neighbor is paired with the {@link Move} that produces it (relative to the blank).
     *
     * @return list of Neighbor objects (state + move); order is deterministic based on index lists.
     */
    public List<Neighbor> neighbors() {
        int blankIndex = indexOfBlank();
        int blankRow = blankIndex / 3;
        int blankCol = blankIndex % 3;

        int[] candidateIndices = BLANK_NEIGHBOR_INDICES[blankIndex];
        List<Neighbor> results = new ArrayList<>(candidateIndices.length);

        for (int fromIndex : candidateIndices) {
            // Determine move direction based on relative position (fromIndex -> blankIndex).
            int fromRow = fromIndex / 3;
            int fromCol = fromIndex % 3;
            Move move;
            if (fromRow == blankRow) {
                move = (fromCol < blankCol) ? Move.LEFT  : Move.RIGHT;  // tile moves horizontally into blank
            } else {
                move = (fromRow < blankRow) ? Move.UP    : Move.DOWN;   // tile moves vertically into blank
            }

            // Swap the tile at fromIndex with the blank to create the neighbor state.
            int[] next = Arrays.copyOf(tiles, 9);
            next[blankIndex] = next[fromIndex];
            next[fromIndex] = 0;

            results.add(new Neighbor(new PuzzleState(next), move));
        }

        return results;
    }

    /**
     * Create the canonical goal state [1,2,3,4,5,6,7,8,0].
     */
    public static PuzzleState goal() {
        return new PuzzleState(GOAL_TILES);
    }

    /**
     * Lightweight value object for (neighbor state, move used).
     */
    public static final class Neighbor {
        private final PuzzleState state;
        private final Move move;

        public Neighbor(PuzzleState state, Move move) {
            this.state = Objects.requireNonNull(state, "neighbor state");
            this.move = Objects.requireNonNull(move, "neighbor move");
        }

        public PuzzleState state() {
            return state;
        }

        public Move move() {
            return move;
        }
    }

    // ---------- Value semantics ----------

    @Override
    public boolean equals(Object other) {
        if (this == other) return true;
        if (!(other instanceof PuzzleState)) return false;
        PuzzleState that = (PuzzleState) other;
        return Arrays.equals(this.tiles, that.tiles);
    }

    @Override
    public int hashCode() {
        return cachedHashCode;
    }

    @Override
    public String toString() {
        return Arrays.toString(tiles);
    }
}
