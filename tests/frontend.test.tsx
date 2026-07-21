import { describe, expect, test } from "bun:test";
import { act, render, screen } from "@testing-library/react";
import { App } from "../frontend";

describe("App", () => {
  test("renders the title", async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getByText("🦊 PixelGuessr")).toBeInTheDocument();
  });

  test("renders instructions", async () => {
    await act(async () => {
      render(<App />);
    });
    expect(
      screen.getByText(
        "Guess what the pixelated image is! Each wrong guess reveals more detail.",
      ),
    ).toBeInTheDocument();
  });

  test("renders the guess input", async () => {
    await act(async () => {
      render(<App />);
    });
    expect(
      screen.getByPlaceholderText('Type your guess (e.g. "cat")'),
    ).toBeInTheDocument();
  });

  test("shows round 1 initially", async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getByText(/Round 1 \/ 5/)).toBeInTheDocument();
  });

  test("renders a canvas element", async () => {
    await act(async () => {
      render(<App />);
    });
    const canvas = document.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
  });
});
