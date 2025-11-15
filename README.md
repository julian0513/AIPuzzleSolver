<<<<<<< HEAD
# AI Puzzle Solver

A full-stack 8-puzzle solver application featuring multiple search algorithms (A*, BFS, DFS) with an interactive React frontend and Spring Boot backend. Solve puzzles manually, watch AI solutions, or upload custom images to create personalized puzzle challenges.

## Features

### Core Functionality
- **Interactive 8-Puzzle Game**: Play the classic sliding tile puzzle with intuitive controls
- **Multiple AI Algorithms**: Choose from A* (with Manhattan heuristic), BFS, or DFS to solve puzzles
- **Real-time Solution Visualization**: Watch step-by-step solutions with animated playback
- **Custom Image Support**: Upload any image to create a personalized puzzle experience
- **Smart Shuffling**: Generate guaranteed-solvable puzzle states with configurable difficulty
- **Coach Mode**: Get visual hints showing which moves improve the puzzle state
- **Performance Metrics**: View algorithm statistics including nodes expanded and solve time

### User Experience
- **Keyboard Controls**: Use arrow keys for quick tile movement
- **Touch-Friendly**: Responsive design optimized for desktop and mobile
- **Visual Feedback**: Animated tile movements, arrow hints, and confetti on completion
- **Timer**: Track your solving time with an integrated stopwatch
- **Solution Panel**: Step through solutions manually or use auto-play

## Architecture

### Backend (Java/Spring Boot)
- **Framework**: Spring Boot 3.2.5 with Java 17
- **REST API**: Clean RESTful endpoints for puzzle operations
- **Search Algorithms**: 
  - **A***: Optimal pathfinding with Manhattan distance heuristic
  - **BFS**: Breadth-first search for guaranteed shortest paths
  - **DFS**: Depth-first search with depth capping for responsiveness
- **Services**: Modular service layer for solving, shuffling, and validation
- **State Management**: Immutable puzzle state representation with efficient neighbor generation

### Frontend (React/Vite)
- **Framework**: React 19 with Vite for fast development
- **Styling**: Tailwind CSS 4 for modern, responsive design
- **State Management**: Custom React hooks for puzzle logic
- **Components**: Modular component architecture
- **API Integration**: Clean service layer for backend communication

## Project Structure

```
AI Puzzle Solver/
├── src/                          # Backend Java source
│   ├── application/              # Spring Boot application entry point
│   ├── controller/               # REST API controllers
│   ├── dto/                     # Data transfer objects (request/response)
│   ├── heuristic/               # Heuristic implementations (Manhattan distance)
│   ├── model/                   # Domain models (PuzzleState, Move, SearchNode)
│   ├── service/                 # Business logic services
│   │   ├── SolverService.java   # Orchestrates solving requests
│   │   ├── ShuffleService.java  # Generates solvable scrambles
│   │   └── SolvabilityService.java # Validates puzzle states
│   ├── solver/                  # Search algorithm implementations
│   │   ├── AStarSolver.java     # A* with heuristic
│   │   ├── BFSSolver.java       # Breadth-first search
│   │   ├── DFSSolver.java       # Depth-first search
│   │   └── SolverFactory.java   # Factory for algorithm selection
│   └── util/                    # Utility classes
├── puzzle-ui/                   # Frontend React application
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── Board.jsx        # Puzzle board display
│   │   │   ├── ArrowPad.jsx     # Directional controls
│   │   │   ├── AlgorithmDropdown.jsx # Algorithm selector
│   │   │   ├── SolutionPanel.jsx # Solution viewer
│   │   │   ├── ImageUpload.jsx  # Image upload interface
│   │   │   └── StatusBar.jsx    # Timer and metrics display
│   │   ├── hooks/               # Custom React hooks
│   │   │   ├── usePuzzle.jsx    # Main puzzle state management
│   │   │   └── useKeyboardControls.jsx # Keyboard input handling
│   │   ├── services/            # API client and services
│   │   └── utils/               # Helper functions and constants
│   └── package.json
├── pom.xml                      # Maven configuration
└── README.md                    # This file
```

## Getting Started

### Prerequisites
- **Java 17+**: Required for the Spring Boot backend
- **Maven 3.6+**: For building the Java project
- **Node.js 18+**: For the React frontend
- **npm** or **yarn**: Package manager for frontend dependencies

### Backend Setup

1. **Navigate to the project root**:
   ```bash
   cd "AI Puzzle Solver"
   ```

2. **Build the project**:
   ```bash
   mvn clean install
   ```

3. **Run the Spring Boot application**:
   ```bash
   mvn spring-boot:run
   ```
   
   The backend will start on `http://localhost:8080` by default.

### Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd puzzle-ui
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   
   The frontend will be available at `http://localhost:5173` (or the next available port).

4. **Build for production**:
   ```bash
   npm run build
   ```

### Configuration

The frontend API client is configured to connect to `http://localhost:8080` by default. If your backend runs on a different port, update the API base URL in `puzzle-ui/src/services/apiClient.jsx`.

## API Endpoints

### `POST /api/puzzle/solve`
Solves a puzzle state using the specified algorithm.

**Request Body**:
```json
{
  "startState": [1, 2, 3, 4, 5, 6, 7, 0, 8],
  "selectedAlgorithm": "astar"
}
```

**Response**:
```json
{
  "moves": ["R"],
  "solveTimeMs": 2,
  "expandedNodeCount": 7,
  "pathStates": [[...], [...]]
}
```

**Algorithms**: `"astar"`, `"bfs"`, `"dfs"`

### `GET /api/puzzle/shuffle?steps=100`
Generates a guaranteed-solvable scrambled puzzle state.

**Query Parameters**:
- `steps` (optional): Number of random moves to apply (default: 100)

**Response**:
```json
{
  "shuffled": [1, 2, 3, 4, 5, 6, 0, 7, 8],
  "movesApplied": 100
}
```

### `POST /api/puzzle/validate`
Validates that a puzzle state is well-formed and solvable.

**Request Body**:
```json
{
  "state": [1, 2, 3, 4, 5, 6, 7, 8, 0]
}
```

**Response**:
```json
{
  "valid": true,
  "solvable": true,
  "message": "State is valid and solvable."
}
```

## How to Use

### Playing the Puzzle

1. **Start a Puzzle**: Click the shuffle button or upload a custom image
2. **Move Tiles**: 
   - Click on tiles adjacent to the blank space
   - Use arrow keys on your keyboard
   - Use the on-screen arrow pad
3. **Get Hints**: Enable "Coach Mode" to see which moves improve the puzzle state
4. **View Solution**: Click the lightbulb icon to see the AI's solution

### Using Custom Images

1. Click the image upload area on the puzzle board
2. Select an image file from your device
3. The image will be automatically sliced into 9 tiles
4. The puzzle will shuffle, and you can solve it with your custom image

### Algorithm Selection

- **A***: Best for optimal solutions with fewer node expansions. Uses Manhattan distance heuristic.
- **BFS**: Guarantees shortest path but may expand more nodes. Explores level by level.
- **DFS**: May find longer paths but explores deeply. Depth is capped at 60 for responsiveness.

### Solution Panel

- **Step Through**: Use Previous/Next buttons to manually step through the solution
- **Auto-Play**: Click Play to automatically animate the solution
- **Reset**: Return to the starting state
- **Metrics**: View nodes expanded and solve time for performance analysis

## Algorithm Details

### A* Search
- **Heuristic**: Manhattan distance (sum of horizontal + vertical distances for each tile)
- **Optimality**: Guarantees optimal (shortest) solution path
- **Efficiency**: Typically expands fewer nodes than BFS due to heuristic guidance
- **Time Complexity**: O(b^d) where b is branching factor, d is solution depth
- **Space Complexity**: O(b^d) for storing the search tree

### Breadth-First Search (BFS)
- **Strategy**: Explores all nodes at depth k before depth k+1
- **Optimality**: Guarantees shortest path in unweighted graphs
- **Efficiency**: May expand many nodes, especially for deep solutions
- **Time Complexity**: O(b^d)
- **Space Complexity**: O(b^d)

### Depth-First Search (DFS)
- **Strategy**: Explores as deep as possible before backtracking
- **Optimality**: Not guaranteed to find shortest path
- **Efficiency**: Memory efficient but may explore long paths
- **Depth Cap**: Limited to 60 moves to prevent infinite exploration
- **Time Complexity**: O(b^m) where m is maximum depth
- **Space Complexity**: O(bm) - more memory efficient

## Puzzle Solvability

The 8-puzzle has a mathematical property that determines solvability:
- **Parity Check**: A puzzle is solvable if the number of inversions (tiles out of order) plus the row distance of the blank from the bottom is even
- The backend automatically validates solvability before attempting to solve
- Shuffling always produces solvable states by applying legal moves from the goal state

## Development

### Building the Project

**Backend**:
```bash
mvn clean package
```

**Frontend**:
```bash
cd puzzle-ui
npm run build
```

### Running Tests

**Backend** (if tests are added):
```bash
mvn test
```

**Frontend** (if tests are added):
```bash
cd puzzle-ui
npm test
```

### Code Style

- **Backend**: Follows Java naming conventions and Spring Boot best practices
- **Frontend**: Uses ESLint for code quality, React hooks for state management

## Dependencies

### Backend
- Spring Boot 3.2.5
- Spring Web (REST API)
- Spring Validation
- Spring Actuator (health checks)

### Frontend
- React 19.1.1
- Vite 7.1.2 (build tool)
- Tailwind CSS 4.1.13 (styling)
- ESLint (linting)

## Customization

### Changing the Goal State
Update `GOAL` constant in `puzzle-ui/src/utils/constants.jsx` and `PuzzleState.goal()` in the backend.

### Adjusting Algorithm Parameters
- **DFS Depth Cap**: Modify `MAX_DEPTH` in `DFSSolver.java`
- **Shuffle Steps**: Change default in `ShuffleService.java` or pass via API
- **Heuristic**: Implement a new `Heuristic` interface for A*

### Styling
The frontend uses Tailwind CSS. Modify `puzzle-ui/tailwind.config.js` and component classes to customize the appearance.

## Troubleshooting

### Backend won't start
- Ensure Java 17+ is installed: `java -version`
- Check port 8080 is not in use
- Verify Maven is installed: `mvn -version`

### Frontend can't connect to backend
- Ensure backend is running on `http://localhost:8080`
- Check CORS configuration in `CorsConfig.java`
- Verify API base URL in `apiClient.jsx`

### Puzzle won't solve
- Ensure the puzzle state is solvable (use validate endpoint)
- Check browser console for API errors
- Verify algorithm name is correct: `"astar"`, `"bfs"`, or `"dfs"`

## License

This project is open source. Please check the repository for license details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Contact

For questions or issues, please open an issue on the GitHub repository.

---

**Enjoy solving puzzles!**
