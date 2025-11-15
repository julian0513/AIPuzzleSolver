package util;

import java.util.Arrays;

/**
 * Utility for 3×3 8-puzzle adjacency:
 *  - Precomputes, per blank index (0..8), which tile indices can slide into the blank.
 *  - Provides helpers to query neighbor indices and convert between linear index and (row,col).
 *
 * Index layout (row-major):
 *   0 1 2
 *   3 4 5
 *   6 7 8
 *
 * Note:
 *  - This mapping matches the logic used by {@code PuzzleState.neighbors()}.
 *  - Methods return defensive copies so callers can’t mutate the internal tables.
 */
public final class AdjacencyUtil {

    private AdjacencyUtil() { /* no instances */ }

    /** Grid dimensions for the classic 8-puzzle. */
    public static final int ROWS = 3;
    public static final int COLS = 3;
    public static final int SIZE = ROWS * COLS;

    /**
     * For each blank index (0..8), the list of tile indices that can move into the blank.
     * Example: at index 0, tiles at indices {1,3} are adjacent and can slide into 0.
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

    /**
     * Return the indices of tiles that can legally slide into the given blank position.
     *
     * @param blankIndex index of the blank (0..8)
     * @return a defensive copy of the neighbor indices array
     * @throws IllegalArgumentException if index is out of range
     */
    public static int[] neighborIndicesForBlank(int blankIndex) {
        validateIndex(blankIndex);
        return Arrays.copyOf(BLANK_NEIGHBOR_INDICES[blankIndex],
                BLANK_NEIGHBOR_INDICES[blankIndex].length);
    }

    /**
     * @return true if {@code tileIndex} is adjacent to {@code blankIndex} (i.e., can slide into it).
     */
    public static boolean isNeighbor(int blankIndex, int tileIndex) {
        validateIndex(blankIndex);
        validateIndex(tileIndex);
        for (int n : BLANK_NEIGHBOR_INDICES[blankIndex]) {
            if (n == tileIndex) return true;
        }
        return false;
    }

    /** Convert linear index (0..8) to row (0..2). */
    public static int toRow(int index) {
        validateIndex(index);
        return index / COLS;
    }

    /** Convert linear index (0..8) to column (0..2). */
    public static int toCol(int index) {
        validateIndex(index);
        return index % COLS;
    }

    /** Convert (row, col) to linear index (0..8). */
    public static int toIndex(int row, int col) {
        if (row < 0 || row >= ROWS || col < 0 || col >= COLS) {
            throw new IllegalArgumentException("Row/Col out of range: (" + row + "," + col + ")");
        }
        return row * COLS + col;
    }

    /** Validate a linear index for the 3×3 grid. */
    private static void validateIndex(int index) {
        if (index < 0 || index >= SIZE) {
            throw new IllegalArgumentException("Index out of range for 3×3 grid: " + index);
        }
    }
}
