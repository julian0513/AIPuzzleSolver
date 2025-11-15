// src/main/java/com/example/puzzle/dto/ShuffleResponse.java
package dto;

/**
 * Response payload for /api/puzzle/shuffle.
 *
 * Fields:
 *  - shuffledState: a guaranteed-solvable 3×3 board encoded as a flat int[9] (0 = blank).
 *  - movesAppliedCount: how many random legal moves were applied from the goal state to produce this scramble.
 */
public class ShuffleResponse {

    /** The scrambled, solvable puzzle state (row-major int[9], values 0..8; 0 is the blank). */
    private int[] shuffledState;

    /** Number of valid moves used to generate the scramble (useful for difficulty/replication). */
    private int movesAppliedCount;

    /** No-args constructor for JSON serialization/deserialization. */
    public ShuffleResponse() {}

    /** Convenience constructor. */
    public ShuffleResponse(int[] shuffledState, int movesAppliedCount) {
        this.shuffledState = shuffledState;
        this.movesAppliedCount = movesAppliedCount;
    }

    // Getters / Setters

    public int[] getShuffledState() {
        return shuffledState;
    }

    public void setShuffledState(int[] shuffledState) {
        this.shuffledState = shuffledState;
    }

    public int getMovesAppliedCount() {
        return movesAppliedCount;
    }

    public void setMovesAppliedCount(int movesAppliedCount) {
        this.movesAppliedCount = movesAppliedCount;
    }

    @Override
    public String toString() {
        return "ShuffleResponse{" +
                "shuffledState=" + (shuffledState == null ? null : java.util.Arrays.toString(shuffledState)) +
                ", movesAppliedCount=" + movesAppliedCount +
                '}';
    }
}
