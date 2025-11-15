package model;

/**
 * Legal moves for the 8-puzzle, defined as the **direction the blank (0) moves**.
 *
 * Conventions:
 * - UP:    the blank swaps with the tile above it    (row - 1, col + 0) → short code "U"
 * - DOWN:  the blank swaps with the tile below it    (row + 1, col + 0) → short code "D"
 * - LEFT:  the blank swaps with the tile to its left (row + 0, col - 1) → short code "L"
 * - RIGHT: the blank swaps with the tile to its right(row + 0, col + 1) → short code "R"
 *
 * Notes:
 * - Using "blank-centric" directions keeps the naming consistent with typical solver outputs ("L","U","R","D").
 * - The UI can animate either the blank or the tile; the semantics here are purely logical.
 */
public enum Move {
    UP   (-1,  0, "U"),
    DOWN ( 1,  0, "D"),
    LEFT ( 0, -1, "L"),
    RIGHT( 0,  1, "R");

    /** Row delta applied to the blank (0) when this move is executed. */
    private final int rowDelta;

    /** Column delta applied to the blank (0) when this move is executed. */
    private final int colDelta;

    /** Compact wire/display form used in API responses and logs. */
    private final String shortCode;

    Move(int rowDelta, int colDelta, String shortCode) {
        this.rowDelta = rowDelta;
        this.colDelta = colDelta;
        this.shortCode = shortCode;
    }

    /** @return the row delta (−1, 0, +1) for the blank. */
    public int getRowDelta() {
        return rowDelta;
    }

    /** @return the column delta (−1, 0, +1) for the blank. */
    public int getColDelta() {
        return colDelta;
    }

    /** @return the compact string form ("U","D","L","R"). */
    public String getShortCode() {
        return shortCode;
    }

    /**
     * @return the opposite move (useful for avoiding immediate backtracking in shuffles).
     */
    public Move opposite() {
        switch (this) {
            case UP:    return DOWN;
            case DOWN:  return UP;
            case LEFT:  return RIGHT;
            case RIGHT: return LEFT;
            default:    throw new IllegalStateException("Unexpected move: " + this);
        }
    }

    /**
     * Parse a short code into a Move (case-insensitive).
     * Accepts: "U","D","L","R"
     */
    public static Move fromShortCode(String code) {
        if (code == null) throw new IllegalArgumentException("Move code cannot be null.");
        switch (code.trim().toUpperCase()) {
            case "U": return UP;
            case "D": return DOWN;
            case "L": return LEFT;
            case "R": return RIGHT;
            default:
                throw new IllegalArgumentException("Unsupported move code: " + code + " (expected U,D,L,R)");
        }
    }
}
