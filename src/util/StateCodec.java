package util;

import model.PuzzleState;


/**
 * Utilities to encode/decode 8-puzzle board states for hashing, logs, and visited sets.
 *
 * Conventions:
 *  - Keys are compact 9-character strings over '0'..'8' in row-major order (e.g., "123405678").
 *  - 0 represents the blank tile.
 *
 * Typical uses:
 *  - Use {@link #toKey(PuzzleState)} or {@link #toKey(int[])} for visited/closed-set keys.
 *  - Use {@link #fromKey(String)} to reconstruct a flat int[9] from a key.
 *  - Use {@link #pretty(int[])} to print a human-readable 3×3 layout for logs/debugging.
 */
public final class StateCodec {

    private StateCodec() { /* no instances */ }

    /** Length of the flat state array / key string for the 3×3 board. */
    public static final int STATE_LEN = 9;

    /**
     * Encode a {@link PuzzleState} into a compact 9-char key (digits '0'..'8').
     * @param state non-null immutable board
     * @return key like "123405678"
     */
    public static String toKey(PuzzleState state) {
        if (state == null) throw new IllegalArgumentException("state cannot be null.");
        return toKey(state.toArray());
    }

    /**
     * Encode a flat int[9] into a compact 9-char key (digits '0'..'8').
     * @param tiles flat row-major array; values must be in 0..8
     * @return key like "123405678"
     */
    public static String toKey(int[] tiles) {
        if (tiles == null) throw new IllegalArgumentException("tiles cannot be null.");
        if (tiles.length != STATE_LEN) {
            throw new IllegalArgumentException("Expected int[9], got length " + tiles.length);
        }
        char[] chars = new char[STATE_LEN];
        for (int i = 0; i < STATE_LEN; i++) {
            int v = tiles[i];
            if (v < 0 || v > 8) {
                throw new IllegalArgumentException("Tile value out of range at index " + i + ": " + v + " (expected 0..8)");
            }
            chars[i] = (char) ('0' + v);
        }
        return new String(chars);
    }

    /**
     * Decode a compact 9-char key into a flat int[9] (digits '0'..'8').
     * @param key non-null string of length 9 over '0'..'8'
     * @return new int[9] array in row-major order
     */
    public static int[] fromKey(String key) {
        if (key == null) throw new IllegalArgumentException("key cannot be null.");
        if (key.length() != STATE_LEN) {
            throw new IllegalArgumentException("Key must be length 9, got " + key.length());
        }
        int[] tiles = new int[STATE_LEN];
        for (int i = 0; i < STATE_LEN; i++) {
            char c = key.charAt(i);
            if (c < '0' || c > '8') {
                throw new IllegalArgumentException("Invalid character at position " + i + ": '" + c + "' (expected '0'..'8')");
            }
            tiles[i] = c - '0';
        }
        return tiles;
    }

    /**
     * Render a flat int[9] as a human-friendly 3×3 grid for logs/debugging.
     * Example:
     *  1 2 3
     *  4 5 6
     *  7 8 0
     */
    public static String pretty(int[] tiles) {
        if (tiles == null) return "null";
        if (tiles.length != STATE_LEN) return "invalid length: " + tiles.length;
        StringBuilder sb = new StringBuilder(3 * 6); // rough capacity
        for (int i = 0; i < STATE_LEN; i++) {
            sb.append(tiles[i]);
            if (i % 3 == 2) {
                if (i < STATE_LEN - 1) sb.append('\n');
            } else {
                sb.append(' ');
            }
        }
        return sb.toString();
    }
}
