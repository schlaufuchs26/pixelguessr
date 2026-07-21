# 🦊 PixelGuessr

Pixelated image guessing game. An image is shown at extremely low resolution (16×16 pixels) and you guess what it is. Each wrong guess doubles the resolution, revealing more detail.

Built with Bun + TypeScript + React. Deployed to GitHub Pages.

## Play

- **Live:** https://schlaufuchs26.github.io/pixelguessr/
- **Source:** https://github.com/schlaufuchs26/pixelguessr

## How it works

- 5 rounds with different images (cat, Eiffel Tower, pizza, guitar, strawberry)
- Start at 16×16 pixels
- Wrong guess → resolution doubles (32×32, 64×64, 128×128, 256×256)
- Score: 5 points at 16×16, 4 at 32×32, 3 at 64×64, 2 at 128×128, 1 at 256×256
- After a correct guess, see the full image and advance to the next round

## Dev

```bash
bun install
bun dev        # dev server with HMR on :3000
bun run build  # build to dist/
bun test       # run tests
bun run checks # format + typecheck + lint + dead code + tests
```
