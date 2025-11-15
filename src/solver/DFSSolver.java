package solver;

import model.Move;
import model.PuzzleState;
import model.SearchNode;
import solver.SolveResult;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * Depth-First Search (DFS) for the 8-puzzle.
 * - Stack (LIFO) + content-based visited to avoid revisits.
 * - Not optimal; we add a modest depth cap for responsiveness.
 * - Deterministic neighbor priority (RIGHT, DOWN, LEFT, UP).
 */
@Component
public class DFSSolver implements Solver {

    /** Depth cutoff to avoid pathological paths (optimal worst case is 31). */
    private static final int MAX_DEPTH = 60;

    /** Fixed exploration order. */
    private static final Move[] ORDER = { Move.RIGHT, Move.DOWN, Move.LEFT, Move.UP };

    /** Java 8-friendly priority map (EnumMap) */
    private static final EnumMap<Move, Integer> PRI = new EnumMap<>(Move.class);
    static {
        PRI.put(Move.RIGHT, 0);
        PRI.put(Move.DOWN,  1);
        PRI.put(Move.LEFT,  2);
        PRI.put(Move.UP,    3);
    }

    @Override
    public SolveResult solve(PuzzleState startState) {
        if (startState == null) throw new IllegalArgumentException("startState cannot be null.");

        // Fast path.
        if (startState.isGoal()) {
            return new SolveResult(
                    Collections.<Move>emptyList(),
                    Collections.singletonList(startState.toArray()),
                    0
            );
        }

        Deque<SearchNode> stack = new ArrayDeque<>();
        int expandedNodeCount = 0;

        // ✅ Content-based visited: hash of the 9 tiles
        Set<Integer> visited = new HashSet<>();
        visited.add(Arrays.hashCode(startState.toArray()));

        // Seed
        stack.push(SearchNode.forUninformed(startState, null, null, 0));

        while (!stack.isEmpty()) {
            SearchNode cur = stack.pop();
            PuzzleState s = cur.getState();

            if (s.isGoal()) {
                return buildSolveResult(cur, expandedNodeCount);
            }

            // Depth cap
            if (cur.getGCost() >= MAX_DEPTH) {
                continue;
            }

            expandedNodeCount++;

            // Generate neighbors and order them by our fixed priority
            List<PuzzleState.Neighbor> nbrs = new ArrayList<PuzzleState.Neighbor>(s.neighbors());

            // Use Collections.sort for widest compatibility (Java 8 OK)
            Collections.sort(nbrs, new Comparator<PuzzleState.Neighbor>() {
                @Override public int compare(PuzzleState.Neighbor a, PuzzleState.Neighbor b) {
                    return Integer.compare(PRI.get(a.move()), PRI.get(b.move()));
                }
            });

            // Push in reverse so first-priority neighbor is explored next (LIFO)
            for (int i = nbrs.size() - 1; i >= 0; i--) {
                PuzzleState.Neighbor nb = nbrs.get(i);
                PuzzleState next = nb.state();
                int key = Arrays.hashCode(next.toArray());
                if (visited.add(key)) { // mark on push
                    stack.push(SearchNode.forUninformed(
                            next, cur, nb.move(), cur.getGCost() + 1
                    ));
                }
            }
        }

        // Shouldn’t happen for validated solvable inputs
        return new SolveResult(
                Collections.<Move>emptyList(),
                Collections.<int[]>emptyList(),
                expandedNodeCount
        );
    }

    /** Rebuilds the root→goal path via parent links. */
    private SolveResult buildSolveResult(SearchNode goal, int expandedNodeCount) {
        List<Move> revMoves = new ArrayList<Move>();
        List<int[]> revStates = new ArrayList<int[]>();
        for (SearchNode n = goal; n != null; n = n.getParent()) {
            revStates.add(n.getState().toArray());
            if (n.getMoveApplied() != null) revMoves.add(n.getMoveApplied());
        }
        Collections.reverse(revStates);
        Collections.reverse(revMoves);
        return new SolveResult(revMoves, revStates, expandedNodeCount);
    }
}
