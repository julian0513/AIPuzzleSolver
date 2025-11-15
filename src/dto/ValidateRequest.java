package dto;

/**
 * Request payload for /api/puzzle/validate.
 *
 * Carries a single 3×3 puzzle state to be checked for:
 *  - structural validity (length 9, values 0..8, all unique, 0 = blank)
 *  - solvability (inversion parity for the 8-puzzle).
 */
public class ValidateRequest {

    /** The board encoded as a flat int[9] in row-major order; values are 0..8 with 0 representing the blank tile. */
    private int[] puzzleState;

    /** No-args constructor for JSON deserialization. */
    public ValidateRequest() {}

    /** Convenience constructor. */
    public ValidateRequest(int[] puzzleState) {
        this.puzzleState = puzzleState;
    }

    // Getters / Setters

    public int[] getPuzzleState() {
        return puzzleState;
    }

    public void setPuzzleState(int[] puzzleState) {
        this.puzzleState = puzzleState;
    }

    @Override
    public String toString() {
        return "ValidateRequest{" +
                "puzzleState=" + (puzzleState == null ? null : java.util.Arrays.toString(puzzleState)) +
                '}';
    }
}
