package controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import service.ShuffleService;
import service.SolvabilityService;
import service.SolverService;
import dto.*;



/**
 * REST controller for 8-puzzle operations:
 *  - /solve:   Compute a solution path using a selected algorithm (A*, BFS, or DFS).
 *  - /shuffle: Generate a guaranteed-solvable scrambled state.
 *  - /validate:Validate that a provided state is well-formed and solvable.
 *
 * Notes:
 *  - All APIs are JSON-based and kept minimal to match the front-end needs.
 *  - Image slicing happens client-side; the backend only receives/returns tile IDs (0..8).
 */
@RestController
@RequestMapping("/api/puzzle")
public class PuzzleController {

    // Services are named explicitly for readability.
    private final SolverService puzzleSolverService;
    private final ShuffleService puzzleShuffleService;
    private final SolvabilityService puzzleSolvabilityService;

    /**
     * Single-constructor injection (Spring will autowire these).
     */
    public PuzzleController(SolverService puzzleSolverService,
                            ShuffleService puzzleShuffleService,
                            SolvabilityService puzzleSolvabilityService) {
        this.puzzleSolverService = puzzleSolverService;
        this.puzzleShuffleService = puzzleShuffleService;
        this.puzzleSolvabilityService = puzzleSolvabilityService;
    }

    /**
     * POST /api/puzzle/solve
     *
     * Request body example:
     * {
     *   "start": [1,2,3,4,5,6,7,0,8],
     *   "algorithm": "astar" // or "bfs" | "dfs"
     * }
     *
     * Response example:
     * {
     *   "moves": ["R"],            // sequence of moves to reach the goal
     *   "solveTimeMs": 2,          // time taken on the server to solve
     *   "expanded": 7,             // (optional) number of expanded nodes
     *   "states": [[...], [...]]   // (optional) intermediate states for playback
     * }
     */
    @PostMapping("/solve")
    public ResponseEntity<SolveResponse> solve(@RequestBody SolveRequest solveRequest) {
        // Delegate to service that selects the correct solver and packages the response DTO.
        SolveResponse solveResponse = puzzleSolverService.solve(solveRequest);
        return ResponseEntity.ok(solveResponse);
    }

    /**
     * GET /api/puzzle/shuffle?steps=100
     *
     * Query param:
     *  - steps: number of random valid moves applied from the goal state to generate a solvable scramble.
     *
     * Response example:
     * {
     *   "shuffled": [1,2,3,4,5,6,0,7,8],
     *   "movesApplied": 100
     * }
     */
    @GetMapping("/shuffle")
    public ResponseEntity<ShuffleResponse> shuffle(
            @RequestParam(name = "steps", defaultValue = "100") int shuffleStepsCount) {

        // Generate a guaranteed-solvable scrambled state by applying valid random moves.
        ShuffleResponse shuffleResponse = puzzleShuffleService.shuffle(shuffleStepsCount);
        return ResponseEntity.ok(shuffleResponse);
    }

    /**
     * POST /api/puzzle/validate
     *
     * Request body example:
     * {
     *   "state": [1,2,3,4,5,6,7,8,0]
     * }
     *
     * Response example:
     * {
     *   "valid": true,
     *   "solvable": true,
     *   "message": "State is valid and solvable."
     * }
     */
    @PostMapping("/validate")
    public ResponseEntity<ValidateResponse> validate(@RequestBody ValidateRequest validateRequest) {
        // Check that the state is length 9, contains each value 0..8 exactly once, and has solvable parity.
        ValidateResponse validateResponse = puzzleSolvabilityService.validate(validateRequest);
        return ResponseEntity.ok(validateResponse);
    }
}
