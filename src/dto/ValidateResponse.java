package dto;

/**
 * Response payload for /api/puzzle/validate.
 *
 * Indicates whether the submitted 8-puzzle state is structurally valid and solvable,
 * along with a short human-readable message.
 */
public class ValidateResponse {

    /** True if the board is length 9, contains values 0..8 each exactly once (0 = blank). */
    private boolean valid;

    /** True if the board passes the 3×3 solvability (inversion parity) check. */
    private boolean solvable;

    /** Brief explanation of the validation result (e.g., why invalid or unsolvable). */
    private String message;

    /** No-args constructor for JSON serialization/deserialization. */
    public ValidateResponse() {}

    /** Convenience constructor. */
    public ValidateResponse(boolean valid, boolean solvable, String message) {
        this.valid = valid;
        this.solvable = solvable;
        this.message = message;
    }

    // Getters / Setters

    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public boolean isSolvable() {
        return solvable;
    }

    public void setSolvable(boolean solvable) {
        this.solvable = solvable;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    @Override
    public String toString() {
        return "ValidateResponse{" +
                "valid=" + valid +
                ", solvable=" + solvable +
                ", message='" + message + '\'' +
                '}';
    }
}
