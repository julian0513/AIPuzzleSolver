package service;

import dto.ShuffleResponse;
import model.Move;
import model.PuzzleState;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

/**
 * Generates guaranteed-solvable scrambles by applying N random legal moves starting from the goal state.
 *
 * Rationale:
 * - Starting from the goal and applying only legal moves ensures the final state is reachable (solvable).
 * - We avoid immediate backtracking (e.g., LEFT followed by RIGHT) to produce more meaningful shuffles.
 */
@Service
public class ShuffleService {

    /**
     * Produce a solvable scrambled state by applying {@code randomMoveCount} random moves from the goal state.
     *
     * @param randomMoveCount number of random legal moves to apply (negative values are treated as zero)
     * @return ShuffleResponse containing the scrambled state and the number of moves actually applied
     */
    public ShuffleResponse shuffle(int randomMoveCount) {
        // Normalize requested step count (no negative loops).
        final int movesToApply = Math.max(0, randomMoveCount);

        // Begin at the canonical goal state [1,2,3,4,5,6,7,8,0].
        PuzzleState currentState = PuzzleState.goal();

        // Track the last move to avoid immediate opposites (e.g., L then R).
        Move previousMove = null;
        int applied = 0;

        for (int i = 0; i < movesToApply; i++) {
            // Generate all legal neighbors from the current state.
            List<PuzzleState.Neighbor> allNeighbors = currentState.neighbors();

            final Move prevMove = previousMove;

            // Prefer neighbors that do NOT immediately undo the previous move.
            List<PuzzleState.Neighbor> filteredNeighbors = (previousMove == null)
                    ? allNeighbors
                    : allNeighbors.stream()
                    .filter(n -> n.move() != prevMove.opposite())
                    .collect(Collectors.toList());

            // If filtering removed all choices (corner cases), fall back to all neighbors.
            List<PuzzleState.Neighbor> candidateNeighbors = filteredNeighbors.isEmpty()
                    ? allNeighbors
                    : filteredNeighbors;

            // Pick one neighbor uniformly at random.
            int choiceIndex = ThreadLocalRandom.current().nextInt(candidateNeighbors.size());
            PuzzleState.Neighbor chosen = candidateNeighbors.get(choiceIndex);

            // Advance: update state and remember the move that produced it.
            currentState = chosen.state();
            previousMove = chosen.move();
            applied++;
        }

        // Return the scrambled board (as int[9]) and how many moves we actually applied.
        return new ShuffleResponse(currentState.toArray(), applied);
    }
}
