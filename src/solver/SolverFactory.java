package solver;

import model.Algorithm;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.Map;
import java.util.Set;

/**
 * Factory that maps an {@link Algorithm} selection to a concrete {@link Solver} implementation.
 *
 * Design:
 * - Uses constructor injection of the three solver beans (A*, BFS, DFS).
 * - Stores them in an {@link EnumMap} for O(1) lookup by Algorithm.
 * - Kept simple and explicit so adding/removing algorithms is trivial.
 */
@Component
public class SolverFactory {

    /** Lookup table from algorithm enum → solver instance. */
    private final Map<Algorithm, Solver> algorithmToSolverMap = new EnumMap<>(Algorithm.class);

    /**
     * Spring will inject the concrete solver beans here.
     * Ensure {@code AStarSolver}, {@code BFSSolver}, and {@code DFSSolver} are annotated as @Component/@Service.
     */
    public SolverFactory(AStarSolver aStarSolver,
                         BFSSolver bfsSolver,
                         DFSSolver dfsSolver) {

        algorithmToSolverMap.put(Algorithm.ASTAR, aStarSolver);
        algorithmToSolverMap.put(Algorithm.BFS, bfsSolver);
        algorithmToSolverMap.put(Algorithm.DFS, dfsSolver);
    }

    /**
     * Returns the solver implementation for the requested algorithm, or {@code null} if unsupported.
     * (Caller may translate a null into a 400 error to the client with a friendly message.)
     */
    public Solver getSolver(Algorithm selectedAlgorithm) {
        if (selectedAlgorithm == null) return null;
        return algorithmToSolverMap.get(selectedAlgorithm);
    }

    /**
     * @return the set of algorithms currently supported by this backend.
     *         Useful for diagnostics or exposing capabilities.
     */
    public Set<Algorithm> getSupportedAlgorithms() {
        return algorithmToSolverMap.keySet();
    }
}
