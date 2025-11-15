package service;


import dto.*;
import model.*;
import solver.*;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Orchestrates solving requests:
 *  1) Validates the incoming board (shape/contents + 3×3 solvability).
 *  2) Selects the requested algorithm (A*, BFS, DFS) via the SolverFactory.
 *  3) Executes the search, measures runtime, and converts the result to a SolveResponse DTO.
 *
 * Notes:
 *  - Image slicing is client-side; server only receives/returns tile IDs (0..8).
 *  - Validation errors are returned to clients as HTTP 400 (BAD REQUEST).
 */
@Service
public class SolverService {

    private final SolverFactory solverFactory;
    private final SolvabilityService solvabilityService;

    public SolverService(SolverFactory solverFactory, SolvabilityService solvabilityService) {
        this.solverFactory = solverFactory;
        this.solvabilityService = solvabilityService;
    }

    /**
     * Entry point invoked by the controller for /api/puzzle/solve.
     * Performs validation, delegates to the selected solver, and packages a response.
     */
    public SolveResponse solve(SolveRequest solveRequest) {
        // ---------- 0) Defensive null checks ----------
        if (solveRequest == null) {
            throw badRequest("Solve request cannot be null.");
        }
        if (solveRequest.getStartState() == null) {
            throw badRequest("Solve request startState is null.");
        }
        if (solveRequest.getSelectedAlgorithm() == null) {
            throw badRequest("Solve request selectedAlgorithm is null (expected astar, bfs, or dfs).");
        }

        // ---------- 1) Validate shape/contents + solvability ----------
        ValidateResponse validation = solvabilityService.validate(
                new ValidateRequest(solveRequest.getStartState())
        );
        if (!validation.isValid()) {
            throw badRequest("Invalid state: " + validation.getMessage());
        }
        if (!validation.isSolvable()) {
            throw badRequest("Unsolvable state: " + validation.getMessage());
        }

        // ---------- 2) Build the immutable PuzzleState from the request ----------
        PuzzleState startState = new PuzzleState(solveRequest.getStartState());
        Algorithm selectedAlgorithm = solveRequest.getSelectedAlgorithm();

        // ---------- 3) Select the solver via factory ----------
        Solver solver = solverFactory.getSolver(selectedAlgorithm);
        if (solver == null) {
            throw badRequest("Unsupported algorithm: " + selectedAlgorithm);
        }

        // ---------- 4) Execute search and measure time ----------
        long t0 = System.nanoTime();
        SolveResult solveResult = solver.solve(startState);
        long elapsedMs = (System.nanoTime() - t0) / 1_000_000L;

        // Sanity check: a solver should always return a non-null result for a solvable state.
        if (solveResult == null) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Solver returned no result; please try again or switch algorithm."
            );
        }

        // ---------- 5) Convert model result -> API DTO ----------
        List<String> moveShortCodes = toShortCodes(solveResult.getMoves());
        List<int[]> pathStates = solveResult.getPathStates(); // may be null if solver didn't collect

        SolveResponse response = new SolveResponse();
        response.setMoves(moveShortCodes);
        response.setSolveTimeMs(elapsedMs);
        response.setExpandedNodeCount(solveResult.getExpandedNodeCount());
        response.setPathStates(pathStates);

        return response;
    }

    // ---------------------------------------------------------------------
    // Internal helpers
    // ---------------------------------------------------------------------

    /** Convert a list of Move enums to compact short codes ("U","D","L","R") for wire/display. */
    private List<String> toShortCodes(List<Move> moves) {
        if (moves == null) return null;
        return moves.stream()
                .filter(Objects::nonNull)
                .map(Move::getShortCode)
                .collect(Collectors.toList());
    }

    /** Build a 400 Bad Request with a clear, client-facing message. */
    private ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}
