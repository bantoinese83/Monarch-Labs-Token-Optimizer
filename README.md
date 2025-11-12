<div align="center">

# 👑 Monarch Labs Token Optimizer

**Compare token usage across JSON, CSV, TOON, and YAML formats**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20App-blue.svg)](https://monarch-labs-token-optimizer.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-Private-red.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Code Quality](https://img.shields.io/badge/code%20quality-A+-green.svg)]()
[![Type Coverage](https://img.shields.io/badge/type%20coverage-100%25-brightgreen.svg)]()
[![Tests](https://img.shields.io/badge/tests-187%20passing-brightgreen.svg)]()

**🌐 Live:** [monarch-labs-token-optimizer.vercel.app](https://monarch-labs-token-optimizer.vercel.app)

</div>

---

## What it does

Token costs add up fast. This tool helps you pick the most efficient data format before you hit the API.

Enter a data description (or paste actual data), and it'll show you how many tokens each format uses. The difference can be 20-30%—at scale, that's real money.

**Supported formats:** JSON, CSV, TOON, YAML

**Token counting:** Uses `tiktoken` with `cl100k_base` encoding (same as GPT-4)

---

## Quick start

**Try it online:** [monarch-labs-token-optimizer.vercel.app](https://monarch-labs-token-optimizer.vercel.app)

No installation needed. Just paste your data description and compare.

### Local setup

```bash
git clone https://github.com/bantoinese83/Monarch-Labs-Token-Optimizer.git
cd Monarch-Labs-Token-Optimizer
npm install
```

Create `.env.local`:
```env
GEMINI_API_KEY=your_key_here
```

Run:
```bash
npm run dev
```

---

## Features

### Core functionality

- **Format comparison** - See token counts for JSON, CSV, TOON, and YAML side-by-side
- **Real-time counting** - Token count updates as you type
- **Cost calculator** - Estimates for 15+ models (GPT-4, Claude, Gemini, Qwen, Llama, etc.)
- **Smart recommendations** - AI suggests the best format based on your data structure
- **Visual analytics** - Charts, breakdowns, and efficiency metrics

### The details

- Uses Google Gemini API to convert your description into all formats
- Token counting happens client-side with `tiktoken`
- Caching layer to avoid redundant API calls
- History saved in localStorage (searchable, deletable)
- Export results as CSV, JSON, or Markdown

### UI/UX

- VS Code-inspired dark theme
- Fixed-height cards with scrolling (no layout shifts)
- Responsive design (mobile, tablet, desktop)
- Keyboard shortcuts for power users
- Syntax highlighting for code blocks
- CSV displayed as an actual table

---

## Screenshots

### Homepage & Input
![Homepage](screenshots/01-homepage.png)
*Clean interface ready for data description input*

### Cards View
![Cards View](screenshots/02-cards-view.png)
*Visual comparison with syntax-highlighted code and cost estimates*

### Table View
![Table View](screenshots/03-table-view.png)
*Tabular comparison with sortable columns*

### Chart View
![Chart View](screenshots/04-chart-view.png)
*Interactive Nivo charts showing token distribution*

### Analysis View
![Analysis View](screenshots/05-analysis-view.png)
*Deep dive into format-specific metrics*

### Cost Calculator
![Cost View](screenshots/06-cost-view.png)
*Multi-model cost estimation with ROI calculations*

### History Sidebar
![History Sidebar](screenshots/07-history-sidebar.png)
*Searchable comparison history*

---

## Tech stack

**Frontend:**
- React 19 with TypeScript (strict mode)
- Vite for bundling
- Tailwind CSS for styling
- Nivo for charts
- Prism.js for syntax highlighting

**Token counting:**
- `tiktoken` (cl100k_base encoding)
- Client-side processing (no server needed)

**AI:**
- Google Gemini API for format generation
- Structured output with JSON schema

**State management:**
- React Context API
- LocalStorage for persistence
- Simple cache with TTL

---

## Development

```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Production build
npm run preview      # Preview production build
npm run type-check   # TypeScript checking
npm run lint         # ESLint
npm run format       # Prettier
npm run check        # Run all checks
```

### Project structure

```
src/
├── components/      # React components
├── contexts/       # State management
├── services/       # API & business logic
├── utils/          # Helpers & utilities
├── constants/      # Config & constants
├── types/          # TypeScript definitions
└── hooks/          # Custom hooks
```

### Code style

- TypeScript strict mode
- ESLint + Prettier
- Path aliases (`@/` for `src/`)
- Barrel exports where it makes sense
- No prop drilling (Context API)

### Testing

The project includes a comprehensive test suite with **187 tests** covering golden cases and edge cases.

```bash
npm run test          # Run tests in watch mode
npm run test:run      # Run tests once (CI mode)
npm run test:ui       # Run tests with UI
npm run test:coverage # Generate coverage report
```

**Test coverage:**
- **CSV Parser** (33 tests) - Parsing, quoted fields, edge cases
- **Tokenizer** (34 tests) - Token analysis, structural vs data tokens
- **Cost Calculator** (19 tests) - Cost calculations, ROI, context windows
- **Recommendations** (21 tests) - Format scoring, context-aware suggestions
- **Export Utilities** (27 tests) - CSV/JSON/Markdown export, shareable links
- **Tip Generator** (25 tests) - AI-generated tips, context awareness
- **Components** (28 tests) - CSVTable, InputForm rendering and behavior

All tests use Vitest with React Testing Library. See `TEST_SUITE.md` for detailed documentation.

---

## How it works

1. **Input** - You describe your data (or paste it)
2. **Generation** - Gemini converts it to JSON, CSV, TOON, and YAML
3. **Tokenization** - Each format is tokenized client-side with `tiktoken`
4. **Analysis** - The app calculates efficiency, structure overhead, cost estimates
5. **Recommendation** - AI suggests the best format based on your data

The whole process is cached, so repeated queries are instant.

---

## Cost models supported

- **OpenAI:** GPT-4, GPT-4 Turbo, GPT-3.5 Turbo, GPT-5 Nano
- **Anthropic:** Claude 3 Opus, Sonnet, Haiku
- **Google:** Gemini Pro, Gemini 2.5 Pro, Gemini 2.5 Flash
- **Others:** Qwen, Llama, GLM, DeepSeek

All pricing is per 1M tokens. Context window limits are validated automatically.

---

## Keyboard shortcuts

- `Ctrl+K` / `Cmd+K` - Cards view
- `Ctrl+T` / `Cmd+T` - Table view
- `Ctrl+C` / `Cmd+C` - Chart view
- `Ctrl+A` / `Cmd+A` - Analysis view
- `Ctrl+D` / `Cmd+D` - Cost view
- `Ctrl+H` / `Cmd+H` - Toggle history

---

## Contributing

PRs welcome. Keep it simple, type-safe, and well-tested.

1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Run `npm run check` (must pass)
5. Submit a PR

---

## License

Private - Monarch Labs

---

## Notes

- Token counting uses the same encoding as GPT-4 (`cl100k_base`)
- Format generation requires a Gemini API key
- All tokenization happens client-side (your data stays private)
- History is stored locally (cleared when you clear browser data)

Built with ❤️ by Monarch Labs

[⬆ Back to Top](#-monarch-labs-token-optimizer)
