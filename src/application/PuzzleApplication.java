package application;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Bootstraps the Spring application and scans subpackages:
 * com.example.puzzle.controller, dto, model, solver, service, heuristic, util.
 */
@SpringBootApplication(scanBasePackages = {
        "controller",   // PuzzleController
        "service",      // ShuffleService, SolverService, SolvabilityService
        "solver",       // your solver implementations
        "dto",          // request/response records
        "util",
        "model",
        "heuristic"
})

public class PuzzleApplication {
    public static void main(String[] args) {
        SpringApplication.run(PuzzleApplication.class, args);
    }
}
