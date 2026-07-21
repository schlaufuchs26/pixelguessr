import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { App } from "../frontend";

describe("App", () => {
  test("renders the title", () => {
    render(<App />);
    expect(screen.getByText("🦊 PixelGuessr")).toBeInTheDocument();
  });

  test("renders instructions", () => {
    render(<App />);
    expect(
      screen.getByText(
        "Guess what the pixelated image is! Each wrong guess reveals more detail.",
      ),
    ).toBeInTheDocument();
  });

  test("renders the guess input", () => {
    render(<App />);
    expect(
      screen.getByPlaceholderText('Type your guess (e.g. "cat")'),
    ).toBeInTheDocument();
  });

  test("shows round 1 initially", () => {
    render(<App />);
    expect(screen.getByText(/Round 1 \/ 5/)).toBeInTheDocument();
  });
});
