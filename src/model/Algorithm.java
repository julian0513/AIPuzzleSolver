package model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Algorithm selection for solving the 8-puzzle.
 * JSON: accepts "astar", "bfs", "dfs" (case-insensitive) and serializes back as lowercase.
 */
public enum Algorithm {
    ASTAR("astar"),
    BFS("bfs"),
    DFS("dfs");

    private final String wireName;

    Algorithm(String wireName) {
        this.wireName = wireName;
    }

    /** Canonical lowercase token used in API payloads (e.g., "astar"). */
    @JsonValue
    public String getWireName() {
        return wireName;
    }

    /** Case-insensitive parser for incoming JSON strings. */
    @JsonCreator
    public static Algorithm fromString(String value) {
        if (value == null) throw new IllegalArgumentException("Algorithm value cannot be null.");
        String normalized = value.trim().toLowerCase();
        for (Algorithm alg : values()) {
            if (alg.wireName.equals(normalized)) return alg;
        }
        throw new IllegalArgumentException("Unsupported algorithm: " + value + " (expected: astar, bfs, dfs)");
    }
}
