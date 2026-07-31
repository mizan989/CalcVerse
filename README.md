# CalcVerse

A scientific calculator built with React, Tailwind CSS, and [mathjs](https://mathjs.org/) — degree/radian trig, memory functions, calculation history, keyboard shortcuts, and three built-in themes.

**Live demo:** _add your GitHub Pages link here after deploying_

## Features

- **Standard + scientific operations** — basic arithmetic plus `sin`, `cos`, `tan` (and their inverses), `log`, `ln`, `√`, `∛`, `x²`, `x³`, `xʸ`, `10ˣ`, `eˣ`, `|x|`, `1/x`, floor/ceiling, factorial, and `mod`
- **DEG / RAD toggle** — switch angle units for trig functions
- **INV toggle** — swap trig buttons for their inverse functions (sin⁻¹, cos⁻¹, tan⁻¹, 10ˣ, eˣ)
- **Memory functions** — MC, MR, MS, M+, M-
- **Live preview** — shows the evaluated result under the current expression as you type
- **Calculation history** — sidebar (drawer on mobile) listing past calculations; click an entry to reuse it, copy it, or delete it
- **Keyboard support** — type expressions directly; `Enter`/`=` to evaluate, `Esc` to clear, plus single-key shortcuts for common functions (see in-app shortcut panel)
- **Three themes** — Dark, Light, and Cyber, toggled from the header
- **Responsive layout** — usable on both desktop and mobile screen sizes

## Tech stack

- [React 19](https://react.dev/)
- [Vite](https://vitejs.dev/) — build tool and dev server
- [Tailwind CSS v4](https://tailwindcss.com/) — styling
- [mathjs](https://mathjs.org/) — expression parsing and evaluation
- [lucide-react](https://lucide.dev/) — icons

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later

### Installation

```bash
git clone https://github.com/YOUR-USERNAME/calcverse.git
cd calcverse
npm install
```

### Run locally

```bash
npm run dev
```

Vite will print a local URL (usually `http://localhost:5173`) — open it in your browser.

### Build for production

```bash
npm run build
```

Output is written to the `dist/` folder.

### Preview the production build

```bash
npm run preview
```

## Deploying to GitHub Pages

This project can be hosted for free with GitHub Pages:

1. Install the deploy helper:
   ```bash
   npm install gh-pages --save-dev
   ```
2. In `vite.config.js`, set `base` to your repo name:
   ```js
   export default defineConfig({
     plugins: [react(), tailwindcss()],
     base: '/calcverse/',
   })
   ```
3. Add to `package.json` scripts:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```
4. Deploy:
   ```bash
   npm run deploy
   ```
5. In your GitHub repo, go to **Settings → Pages**, set source to the `gh-pages` branch, and save.

Your app will be live at `https://YOUR-USERNAME.github.io/calcverse/`.

## Project structure

```
calcverse/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/
│   ├── App.jsx          # renders CalcVerse
│   ├── CalcVerse.jsx    # main calculator component
│   ├── index.css        # Tailwind import + base styles
│   └── main.jsx         # React entry point
├── index.html
├── vite.config.js
├── eslint.config.js
└── package.json
```

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `0`–`9`, `+ - * / ( ) . % ^` | Enter digits and operators |
| `Enter` or `=` | Evaluate expression |
| `Backspace` | Delete last character |
| `Esc` | Clear |
| `S` | Insert `sin(` |
| `C` | Insert `cos(` |
| `T` | Insert `tan(` |
| `L` | Insert `log(` (log base 10) |
| `N` | Insert `ln(` (natural log) |
| `P` | Insert `π` |
| `E` | Insert Euler's number `e` |

## License

Free to use and modify for personal or educational purposes.
