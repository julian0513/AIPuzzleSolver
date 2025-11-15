package solver;

import model.*;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * Breadth-First Search (BFS) solver for the 8-puzzle.
 *
 * Characteristics:
 * - Uninformed search (no heuristic); explores states in increasing path length.
 * - On an unweighted graph like the 8-puzzle, BFS finds a shortest path in number of moves.
 * - Uses a FIFO queue for the frontier and a visited set to avoid revisiting states.
 */
@Component
public class BFSSolver implements Solver {

    /**
     * Compute a shortest path (fewest moves) from the given start state to the canonical goal [1,2,3; 4,5,6; 7,8,0].
     * Assumes the caller has validated the start state’s shape and solvability.
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

        // Frontier (FIFO) of nodes to explore next.
        ArrayDeque<SearchNode> frontierQueue = new ArrayDeque<>();

        // Set of states we have already visited to prevent cycles/redundant work.
        Set<PuzzleState> visitedStates = new HashSet<>();

        // Seed frontier with the start node; BFS is "uninformed" so h=0 (use the dedicated factory).
        SearchNode startNode = SearchNode.forUninformed(startState, /* parent */ null, /* move */ null, /* g */ 0);
        frontierQueue.add(startNode);
        visitedStates.add(startState);

        int expandedNodeCount = 0; // Diagnostics: number of dequeued/expanded nodes.

        while (!frontierQueue.isEmpty()) {
            // Dequeue the next node to expand (level-order).
            SearchNode currentNode = frontierQueue.removeFirst();
            PuzzleState currentState = currentNode.getState();
            expandedNodeCount++;

            // Expand all legal neighbors: slide a tile into the blank.
            for (PuzzleState.Neighbor neighbor : currentState.neighbors()) {
                PuzzleState nextState = neighbor.state();

                // Skip if we've already seen this board configuration.
                if (visitedStates.contains(nextState)) {
                    continue;
                }

                // Construct the child node; cost so far increases by 1 for each move.
                SearchNode childNode = SearchNode.forUninformed(
                        nextState,
                        currentNode,
                        neighbor.move(),  // move taken from current to next
                        currentNode.getGCost() + 1
                );

                // Goal test on generation ensures the first time we see the goal, it's at minimum depth.
                if (nextState.isGoal()) {
                    return buildSolveResult(childNode, expandedNodeCount);
                }

                // Otherwise, enqueue for later expansion and mark as visited.
                frontierQueue.addLast(childNode);
                visitedStates.add(nextState);
            }
        }

        // For a valid, solvable start, BFS should always find a solution.
        return new SolveResult(
                /* moves */ Collections.emptyList(),
                /* pathStates */ Collections.emptyList(),
                /* expandedNodeCount */ expandedNodeCount
        );
    }

    // ---------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------

    /**
     * Reconstruct the solution (moves and states) by following parent links from the goal node back to the root.
     * Produces moves in start → goal order and the corresponding path of board states.
     */
    private SolveResult buildSolveResult(SearchNode goalNode, int expandedNodeCount) {
        List<Move> reversedMoves = new ArrayList<>();
        List<int[]> reversedStates = new ArrayList<>();

        for (SearchNode node = goalNode; node != null; node = node.getParent()) {
            reversedStates.add(node.getState().toArray());
            if (node.getMoveApplied() != null) {
                reversedMoves.add(node.getMoveApplied());
            }
        }

        Collections.reverse(reversedStates);
        Collections.reverse(reversedMoves);

        return new SolveResult(reversedMoves, reversedStates, expandedNodeCount);
    }
}
