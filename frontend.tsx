import { useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  getResolution,
  isMaxResolution,
  ROUNDS,
  scoreForWrongGuesses,
} from "./game";

type GameState = "playing" | "guessed-correct" | "round-end";

const CANVAS_SIZE = 320; // CSS pixels for the canvas display

function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawPixelated(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  resolution: number,
  canvasSize: number,
) {
  // Clear canvas
  ctx.clearRect(0, 0, canvasSize, canvasSize);

  // Draw the image at the small resolution into the full canvas using nearest-neighbor
  // We create an offscreen canvas to do the small render first, then scale up
  const offscreen = document.createElement("canvas");
  offscreen.width = resolution;
  offscreen.height = resolution;
  const offCtx = offscreen.getContext("2d");
  if (!offCtx) return;

  // Draw the full image downscaled to the small resolution
  offCtx.drawImage(img, 0, 0, resolution, resolution);

  // Now scale that small image up to the main canvas with pixel-perfect rendering
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(offscreen, 0, 0, canvasSize, canvasSize);
}

export function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [roundIndex, setRoundIndex] = useState(0);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [roundScore, setRoundScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>("playing");
  const [message, setMessage] = useState("");
  const [imageLoaded, setImageLoaded] = useState<HTMLImageElement | null>(null);
  const [guess, setGuess] = useState("");

  const currentRound = ROUNDS[roundIndex] ?? { image: "", name: "Unknown" };
  const resolution = getResolution(wrongGuesses);

  // Preload image when round changes
  useEffect(() => {
    let cancelled = false;
    setImageLoaded(null);
    preloadImage(currentRound.image)
      .then((img) => {
        if (!cancelled) setImageLoaded(img);
      })
      .catch(() => {
        if (!cancelled) setMessage("Failed to load image");
      });
    return () => {
      cancelled = true;
    };
  }, [currentRound.image]);

  // Draw to canvas whenever image or resolution changes
  useEffect(() => {
    if (!canvasRef.current || !imageLoaded) return;
    const canvas = canvasRef.current;
    // Handle DPI scaling for sharp rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_SIZE * dpr;
    canvas.height = CANVAS_SIZE * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    if (gameState === "guessed-correct") {
      // Show full image
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(imageLoaded, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
    } else {
      drawPixelated(ctx, imageLoaded, resolution, CANVAS_SIZE);
    }
  }, [imageLoaded, resolution, gameState]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!guess.trim()) return;

      const guessedName = currentRound.name.toLowerCase();
      const userGuess = guess.trim().toLowerCase();

      // Accept if the guess includes the round name (or vice versa for partial matches)
      const isCorrect =
        userGuess === guessedName ||
        userGuess.includes(guessedName) ||
        guessedName.includes(userGuess);

      if (isCorrect) {
        const points = scoreForWrongGuesses(wrongGuesses);
        setRoundScore(points);
        setTotalScore((s) => s + points);
        setGameState("guessed-correct");
        setMessage(`Correct! +${points} points 🎉`);
      } else {
        const newWrong = wrongGuesses + 1;
        setWrongGuesses(newWrong);
        setGuess("");

        if (isMaxResolution(newWrong)) {
          setGameState("round-end");
          setMessage(
            `Out of guesses! It was "${currentRound.name}". No points this round.`,
          );
        } else {
          const nextRes = getResolution(newWrong);
          setMessage(`Nope! Now at ${nextRes}×${nextRes}`);
        }
      }
    },
    [guess, currentRound.name, wrongGuesses],
  );

  const handleNextRound = useCallback(() => {
    if (roundIndex >= ROUNDS.length - 1) {
      // Game complete!
      setGameState("round-end");
      setMessage(
        `Game over! Final score: ${totalScore} / ${ROUNDS.length * 5}`,
      );
      return;
    }
    setRoundIndex((i) => i + 1);
    setWrongGuesses(0);
    setRoundScore(0);
    setGameState("playing");
    setMessage("");
    setGuess("");
    inputRef.current?.focus();
  }, [roundIndex, totalScore]);

  const handleRestart = useCallback(() => {
    setRoundIndex(0);
    setWrongGuesses(0);
    setRoundScore(0);
    setTotalScore(0);
    setGameState("playing");
    setMessage("");
    setGuess("");
    inputRef.current?.focus();
  }, []);

  const allDone = roundIndex >= ROUNDS.length - 1 && gameState === "round-end";

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🦊 PixelGuessr</h1>
      <p style={styles.instructions}>
        Guess what the pixelated image is! Each wrong guess reveals more detail.
      </p>

      <div style={styles.infoBar}>
        <span>
          Round {roundIndex + 1} / {ROUNDS.length}
        </span>
        {roundScore > 0 && <span>+{roundScore}</span>}
        <span>Score: {totalScore}</span>
        <span>
          {resolution}×{resolution}
        </span>
      </div>

      <div style={styles.canvasWrapper}>
        <canvas
          ref={canvasRef}
          style={{
            ...styles.canvas,
            imageRendering: "pixelated",
          }}
        />
      </div>

      {message && <p style={styles.message}>{message}</p>}

      {gameState === "playing" && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            ref={inputRef}
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder='Type your guess (e.g. "cat")'
            style={styles.input}
            disabled={!imageLoaded}
          />
          <button type="submit" style={styles.button} disabled={!imageLoaded}>
            {imageLoaded ? "Guess" : "Loading..."}
          </button>
        </form>
      )}

      {gameState === "guessed-correct" && (
        <button type="button" onClick={handleNextRound} style={styles.button}>
          {roundIndex < ROUNDS.length - 1 ? "Next Round →" : "See Final Score"}
        </button>
      )}

      {gameState === "round-end" && (
        <div>
          {allDone && (
            <p style={styles.finalScore}>
              Final Score: {totalScore} / {ROUNDS.length * 5}
            </p>
          )}
          <button type="button" onClick={handleRestart} style={styles.button}>
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}

// Styles as a style object
const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 420,
    margin: "0 auto",
    padding: "24px 16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
  },
  title: {
    fontSize: "2rem",
    fontWeight: 700,
    margin: 0,
  },
  instructions: {
    color: "var(--muted)",
    fontSize: "0.9rem",
    textAlign: "center",
    margin: 0,
    maxWidth: 320,
  },
  infoBar: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: 320,
    fontSize: "0.85rem",
    color: "var(--muted)",
  },
  canvasWrapper: {
    border: "2px solid var(--accent)",
    borderRadius: 8,
    overflow: "hidden",
    lineHeight: 0,
  },
  canvas: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    display: "block",
  },
  message: {
    fontSize: "1rem",
    fontWeight: 600,
    textAlign: "center",
    margin: 0,
  },
  form: {
    display: "flex",
    gap: 8,
    width: "100%",
    maxWidth: 320,
  },
  input: {
    flex: 1,
    padding: "10px 14px",
    fontSize: "1rem",
    border: "1px solid #444",
    borderRadius: 8,
    background: "var(--surface)",
    color: "var(--text)",
    outline: "none",
  },
  button: {
    background: "var(--accent)",
    color: "var(--bg)",
    border: "none",
    padding: "10px 20px",
    fontSize: "1rem",
    fontWeight: 600,
    borderRadius: 8,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  finalScore: {
    fontSize: "1.3rem",
    fontWeight: 700,
    textAlign: "center",
  },
};

const el = document.getElementById("root");
if (el) {
  const root = createRoot(el);
  root.render(<App />);
}
