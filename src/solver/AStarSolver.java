package solver;

import heuristic.Heuristic;
import model.*;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * A* solver for the 8-puzzle.
 *
 * Core idea:
 *  - Maintain a priority queue (the "open set") ordered by f = g + h,
 *    where g is the path cost (moves so far) and h is the heuristic estimate to goal.
 *  - Pop the most promising node, expand its neighbors, and stop when we dequeue the goal.
 *  - Use a "closed set" to avoid reprocessing the same board states.
 *
 * Notes:
 *  - Heuristic is injected (e.g., Manhattan distance) to keep the solver pluggable/testable.
 *  - Returns the optimal (fewest-move) solution when the heuristic is admissible/consistent.
 */
@Component
public class AStarSolver implements Solver {

    private final Heuristic heuristic;

    /**
     * @param heuristic an admissible/consistent estimator (e.g., Manhattan distance)
     */
    public AStarSolver(Heuristic heuristic) {
        this.heuristic = Objects.requireNonNull(heuristic, "heuristic");
    }

    /**
     * Compute an optimal path from the given start state to the canonical goal [1,2,3; 4,5,6; 7,8,0].
     * The caller must pass a valid and solvable state (validated by the service layer).
     */
    @Override
    public SolveResult solve(PuzzleState startState) {
        if (startState == null) {
            throw new IllegalArgumentException("startState cannot be null.");
        }

        // Fast-path: already solved.
        if (startState.isGoal()) {
            return new SolveResult(
                    /* moves */ Collections.emptyList(),
                    /* pathStates */ Collections.singletonList(startState.toArray()),
                    /* expandedNodeCount */ 0
            );
        }

        // Open set (frontier) ordered by f = g + h (ties broken by h, then g; see SearchNode.compareTo).
        PriorityQueue<SearchNode> openSet = new PriorityQueue<>();

        // Closed set of states we've already fully processed.
        Set<PuzzleState> closedSet = new HashSet<>();

        // Seed the frontier with the start node.
        int startH = heuristic.estimate(startState);
        SearchNode startNode = SearchNode.forAStar(startState, /* parent */ null, /* move */ null, /* g */ 0, /* h */ startH);
        openSet.add(startNode);

        int expandedCount = 0; // for diagnostics/UX

        // Main A* loop.
        while (!openSet.isEmpty()) {
            // Take the most promising node (lowest f = g + h).
            SearchNode currentNode = openSet.poll();
            PuzzleState currentState = currentNode.getState();

            // If we've already settled this state, skip (can happen due to multiple PQ entries).
            if (closedSet.contains(currentState)) {
                continue;
            }

            // Mark as processed.
            closedSet.add(currentState);
            expandedCount++;

            // Goal check: because we pop in order of non-decreasing f, the first goal we pop is optimal.
            if (currentState.isGoal()) {
                return buildSolveResult(currentNode, expandedCount);
            }

            // Expand neighbors: generate legal board states by sliding tiles into the blank.
            for (PuzzleState.Neighbor neighbor : currentState.neighbors()) {
                PuzzleState nextState = neighbor.state();

                // Skip if we've already processed this board.
                if (closedSet.contains(nextState)) {
                    continue;
                }

                int nextG = currentNode.getGCost() + 1;            // each move costs 1
                int nextH = heuristic.estimate(nextState);          // estimated distance to goal
                SearchNode childNode = SearchNode.forAStar(
                        nextState,
                        currentNode,
                        neighbor.move(),                             // move taken from current to next
                        nextG,
                        nextH
                );

                // Push onto the frontier; if a better path to the same state exists, it will win by f-ordering.
                openSet.add(childNode);
            }
        }

        // For a valid, solvable start this should not happen.
        // Returning an empty result signals an unexpected failure upstream (service will handle as 500).
        return new SolveResult(
                /* moves */ Collections.emptyList(),
                /* pathStates */ Collections.emptyList(),
                /* expandedNodeCount */ expandedCount
        );
    }

    // ---------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------

    /**
     * Reconstruct the move list and path states from the goal node back to the start.
     * Produces moves in start → goal order and (optionally) the sequence of board states.
     */
    private SolveResult buildSolveResult(SearchNode goalNode, int expandedCount) {
        List<Move> movesReversed = new ArrayList<>();
        List<int[]> statesReversed = new ArrayList<>();

        // Walk backward via parent links, collecting moves and states.
        for (SearchNode node = goalNode; node != null; node = node.getParent()) {
            statesReversed.add(node.getState().toArray());
            if (node.getMoveApplied() != null) {
                movesReversed.add(node.getMoveApplied());
            }
        }

        // Reverse to get start → goal ordering.
        Collections.reverse(statesReversed);
        Collections.reverse(movesReversed);

        return new SolveResult(movesReversed, statesReversed, expandedCount);
    }
}
