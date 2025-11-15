package service;


import dto.ValidateRequest;
import dto.ValidateResponse;
import org.springframework.stereotype.Service;

import java.util.Arrays;

/**
 * Validates 8-puzzle states for shape/contents and solvability.
 *
 * Rules applied:
 *  - Shape/contents: array length must be 9; values must be exactly {0..8} each once (0 = blank).
 *  - Solvability (3×3 board): the number of inversions (ignoring 0) must be EVEN.
 *    (For odd-width boards like 3×3, solvability depends only on inversion parity.)
 */
@Service
public class SolvabilityService {

    /**
     * Validate a provided puzzle state for structure and solvability.
     * Returns a detailed response with booleans and a concise message.
     */
    public ValidateResponse validate(ValidateRequest validateRequest) {
        if (validateRequest == null || validateRequest.getPuzzleState() == null) {
            return new ValidateResponse(false, false, "Request or puzzleState is null.");
        }

        int[] puzzleState = validateRequest.getPuzzleState();

        // 1) Check shape/contents first.
        String shapeError = validateShapeAndContents(puzzleState);
        if (shapeError != null) {
            return new ValidateResponse(false, false, shapeError);
        }

        // 2) Check solvability (3×3 rule: inversions must be even).
        boolean solvable = isSolvable3x3(puzzleState);
        if (!solvable) {
            int inversions = countInversions(puzzleState);
            return new ValidateResponse(true, false,
                    "Unsolvable 3×3 configuration: inversion count is odd (" + inversions + ").");
        }

        return new ValidateResponse(true, true, "State is valid and solvable.");
    }

    // ---------------------------------------------------------------------
    // Internal helpers
    // ---------------------------------------------------------------------

    /**
     * Ensures length is 9 and values are exactly {0..8} each once.
     *
     * @return null if OK; otherwise a human-readable error message.
     */
    private String validateShapeAndContents(int[] state) {
        if (state.length != 9) {
            return "Invalid shape: expected length 9, got " + state.length + ".";
        }

        // Track seen values using a boolean array indexed by tile value.
        boolean[] seen = new boolean[9];
        for (int value : state) {
            if (value < 0 || value > 8) {
                return "Invalid tile value: " + value + " (allowed range is 0..8).";
            }
            if (seen[value]) {
                return "Duplicate tile value detected: " + value + ".";
            }
            seen[value] = true;
        }

        // If all checks passed, state is structurally valid.
        return null;
    }

    /**
     * 3×3 solvability rule: the inversion count (ignoring 0) must be EVEN.
     */
    private boolean isSolvable3x3(int[] state) {
        int inversions = countInversions(state);
        return (inversions % 2) == 0;
    }

    /**
     * Count inversions in the permutation, ignoring the blank (0).
     * An inversion is a pair (i, j) such that i < j, state[i] > state[j], and both are non-zero.
     */
    private int countInversions(int[] state) {
        int inversionCount = 0;
        for (int i = 0; i < state.length; i++) {
            int a = state[i];
            if (a == 0) continue; // ignore blank
            for (int j = i + 1; j < state.length; j++) {
                int b = state[j];
                if (b == 0) continue; // ignore blank
                if (a > b) inversionCount++;
            }
        }
        return inversionCount;
    }

    // Optional: utility to pretty-print state in logs (not used in API).
    @SuppressWarnings("unused")
    private String formatState(int[] state) {
        return Arrays.toString(state);
    }
}
