# NeuralScholar — Interactive Deep Learning Course

> A browser-based, fully interactive deep-learning learning tool built from the **CCE3144 (Manipal University Jaipur)** lecture notes by **Dr. Manoj Kumar Sharma**. Learn every core concept — from the single perceptron to GANs, VAEs and Boltzmann Machines — through **~35 live visual widgets**, worked examples, quizzes and progress tracking.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma + SQLite](https://img.shields.io/badge/Prisma-SQLite-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Zustand](https://img.shields.io/badge/Zustand-5-F75900?style=for-the-badge)](https://zustand-demo.pmnd.rs/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## What is this?

**NeuralScholar** is an interactive deep-learning textbook and course player. Instead of passively reading about backpropagation or staring at static CNN diagrams, you **manipulate the math directly**:

- Drag weights and bias to move a perceptron's decision line, then try AND/OR/XOR presets.
- Step through the exact forward pass, backward pass and weight update of a 2-2-1 network — watch every gradient recompute live.
- Slide a 3×3 convolution filter across an input, one position at a time, building each dot product.
- Toggle ReLU vs sigmoid vs tanh on a shared plot and see where gradients vanish.
- Build an LSTM cell gate by gate, then compare RNN vs LSTM vs GRU side by side.
- Train a mini GAN in a "training arena", explore VAEs, autoencoders, RBMs, DBNs and DBMs.

Every widget is paired with **worked examples taken straight from the CCE3144 notes**, so the visual play matches the course syllabus exactly.

---

## Course contents

The course is organised into **4 units** mirroring the CCE3144 syllabus, each with lessons, interactive widgets, worked examples and end-of-unit quizzes. Progress (completed lessons, quiz best scores, XP) is saved in your browser via Zustand persistence.

### Unit 1 — Introduction to Deep Learning
*Source: `CCE3144_Deep_Learning_Unit1.pdf`*

Topics: Perceptron · Learning Paradigms · Loss Functions · Backpropagation · Gradient Descent

| Lesson | What you'll do |
|--------|----------------|
| 1. What is Deep Learning? | Explore the AI ⊃ ML ⊃ DL nesting, image-recognition hierarchy, and the biological-vs-artificial neuron mapping |
| 2. The Perceptron | Drag weights & bias to move the decision line; AND/OR/XOR presets; full AND-gate training trace |
| 3. Learning Paradigms | Supervised vs unsupervised comparison; K-Means clustering lab (4-point worked example) |
| 4. Loss Functions | MSE/MAE/BCE/CCE loss landscape explorer; why cross-entropy beats MSE for classification |
| 5. Backpropagation | Full 2-2-1 sigmoid network walk-through — forward pass → backward pass → weight update; activation explorer |
| 6. Gradient Descent & SGD | Gradient-descent playground — batch vs mini-batch vs stochastic paths on a loss surface |

### Unit 2 — Convolutional Neural Networks
*Source: `CCE3144_Deep_Learning_CNN_Unit2.pdf`*

Topics: Convolution · Pooling · Batch Normalization · AlexNet · VGG · Inception · ResNet

| Lesson | What you'll do |
|--------|----------------|
| 1. CNNs — The Big Picture | Dense-vs-convolution parameter counter (watch conv params stay flat as image size grows) |
| 2. Convolution | Convolution laboratory — slide a 3×3 filter across a 5×5 input, all nine positions |
| 3. Output Size & Padding | Output-size calculator — drag N, F, P, S; see "same" padding snap to `(F−1)/2` |
| 4. Pooling | Receptive-field builder — stack 3×3 layers vs one 7×7; pooling lab (max/avg/global) |
| 5. Training | Training loop step-by-step — forward → loss → backward → update |
| 6. Initialization | Initialization explorer — zero, plain-random, Xavier, He layer by layer |
| 7. Batch Normalization | BN lab — mean, variance, normalize, scale & shift on your own mini-batch |
| 8. Dropout | Dropout simulator — random masks, `1/(1−p)` scaling, train vs test time |
| 9. Architecture Gallery | AlexNet, VGG16, GoogLeNet, ResNet side by side with depth & parameter counts |

### Unit 3 — Recurrent Neural Networks
*Source: `CCE3144_RNN_LSTM_GRU_Unit3.pdf`*

Topics: RNN & BPTT · LSTM · GRU · Language Models & Perplexity

| Lesson | What you'll do |
|--------|----------------|
| 1. RNN Cell | RNN cell lab — folded & unrolled; the five input/output wiring patterns |
| 2. BPTT | BPTT gradient-flow lab; `λᵀ` decay/blast-off experiment |
| 3. LSTM | LSTM cell lab — forget/input/candidate/output gates on the cell-state conveyor belt |
| 4. GRU | GRU cell lab — update/reset gates interpolating old state & new candidate |
| 5. Language Model | Language model lab — embedding → recurrence → softmax read-out; perplexity |
| 6. Compare | RNN vs LSTM vs GRU — memory, gates, gradients, parameters, speed side by side |

### Unit 4 — Deep Unsupervised Learning
*Source: `CCE3144_Deep_Unsupervised_Learning_Unit4.pdf`*

Topics: Autoencoders · VAE · GAN · MaxEnt · RBM · DBN · DBM · Convolutional Boltzmann Machines

| Lesson | What you'll do |
|--------|----------------|
| 1. Landscape | Deep unsupervised learning model map — the unifying idea across families |
| 2. Autoencoders | Autoencoder lab — sparsity penalty computation, overcomplete trap |
| 3. VAEs | VAE lab — reparameterization trick, ELBO derivation, β-VAE |
| 4. GANs | GAN training arena — minimax game, optimal discriminator, mode collapse |
| 5. Maximum Entropy | Entropy explorer — MaxEnt principle, uniform & Gaussian derivations |
| 6. RBMs | RBM energy & CD-1 lab — contrastive divergence training |
| 7. DBNs / DBMs | DBN vs DBM structure explorer — stacking RBMs, top-down feedback |
| 8. Convolutional BMs | Convolutional Boltzmann Machines |

**~35 interactive widgets** in total, each wrapped in a consistent `WidgetFrame` with title, description and per-unit accent colour (U1–U4).

---

## Key features

| Feature | Description |
|---------|-------------|
| 🎯 **Interactive widgets** | SVG/Canvas visualisations for every major DL concept — perceptrons, conv filters, RNN cells, GANs, VAEs, RBMs and more |
| 📚 **Course player** | Sidebar navigation through 4 units, 30 lessons, quizzes, lesson completion and XP tracking |
| ✍️ **Worked examples** | Every mathematical derivation mirrors the CCE3144 notes with computer-verified numbers |
| ❓ **Quizzes** | Per-lesson check questions and end-of-unit quizzes with best-score tracking |
| 💾 **Browser persistence** | Progress saved in `localStorage` (Zustand `persist`) — no account required |
| 🌓 **Dark mode** | Light/dark theme toggle (Next Themes) |
| 🧩 **shadcn/ui** | Accessible Radix-based component primitives |
| 📐 **KaTeX math** | Inline LaTeX formulas rendered throughout the lessons |
| 🔌 **Prisma + SQLite** | Database client ready (schema includes `User` and `Post` models) |
| 📦 **Standalone build** | `next build` produces a standalone output for containerised deployment |
| 🌐 **Caddy reverse proxy** | `Caddyfile` proxies port 81 → Next.js on port 3000 |

---

## Tech stack

**Framework & runtime**
- [Next.js 16](https://nextjs.org/) (App Router, `output: "standalone"`)
- [React 19](https://react.dev/) + [React DOM 19](https://react.dev/)
- [TypeScript 5](https://www.typescriptlang.org/)
- [Bun](https://bun.sh/) (lockfile + dev server)

**Styling & UI**
- [Tailwind CSS 4](https://tailwindcss.com/) + `tailwindcss-animate`
- [shadcn/ui](https://ui.shadcn.com/) (Radix primitives)
- [lucide-react](https://lucide.dev/) icons
- [framer-motion](https://www.framer.com/motion/) animations
- [sonner](https://sonner.emilkowal.ski/) toasts
- [next-themes](https://github.com/pacocoursey/next-themes) dark mode
- [Geist](https://vercel.com/font) fonts (Sans + Mono)

**Data & state**
- [Zustand 5](https://zustand-demo.pmnd.rs/) course progress (persisted to `localStorage`)
- [TanStack Query](https://tanstack.com/query/latest) + [TanStack Table](https://tanstack.com/table/8)
- [Prisma 6](https://www.prisma.io/) + [@prisma/client](https://www.prisma.io/docs/reference/api-reference) (SQLite)
- [zod 4](https://zod.dev/) validation
- [react-hook-form](https://react-hook-form.com/) + resolvers
- [zustand](https://zustand-demo.pmnd.rs/) persistence

**Content & media**
- [KaTeX](https://katex.org/) math rendering
- [react-markdown](https://github.com/remarkjs/react-markdown) + [react-syntax-highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter)
- [@mdxeditor/editor](https://mdxeditor.dev/) rich text editor
- [recharts](https://recharts.org/) charts
- [embla-carousel-react](https://www.embla-carousel.com/) carousels
- [@dnd-kit](https://docs.dndkit.com/) drag-and-drop

**Auth, i18n, other**
- [next-auth](https://next-auth.js.org/) (v4)
- [next-intl](https://next-intl.dev/) internationalisation
- [uuid](https://github.com/uuidjs/uuid), [date-fns](https://date-fns.org/), [class-variance-authority](https://cva.style/), [clsx](https://github.com/lukeed/clsx), [tailwind-merge](https://tailwind-merge.dub.zsun.dev/)

---

## Getting started

### Prerequisites
- [Bun](https://bun.sh/) (recommended — `bun.lock` is committed) or Node.js + npm/yarn/pnpm

### Install dependencies
```bash
bun install
# or: npm install / yarn install / pnpm install
```

### Database (Prisma + SQLite)
```bash
# Generate Prisma client
bun run db:generate

# Push schema to SQLite (creates db/custom.db)
bun run db:push
```

The `DATABASE_URL` is configured in `.env` (points to `db/custom.db`). The `User`/`Post` models are present in `prisma/schema.prisma`; the course progress itself is stored in-browser via Zustand.

### Run the dev server
```bash
bun run dev
# → http://localhost:3000
```

The dev script also tees output to `dev.log`.

### Production build & start
```bash
bun run build      # Next.js standalone build
bun run start      # NODE_ENV=production bun .next/standalone/server.js
```

The standalone build copies `.next/static` and `public` into `.next/standalone/` so it can run as a self-contained directory.

### Reverse proxy (Caddy)
A `Caddyfile` is included that proxies `:81` → `localhost:3000` with forwarded headers, plus an optional `XTransformPort` query-based reverse proxy.

---

## Project structure

```
NeuralScholar/
├── public/                 # Static assets (logo.svg, robots.txt)
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── page.tsx        # Root page → AppShell
│   │   ├── api/route.ts    # Sample API route (GET "Hello, world!")
│   │   ├── globals.css
│   │   └── layout.tsx      # Root layout (ThemeProvider, Toaster, metadata)
│   ├── components/
│   │   ├── learn/          # Course player
│   │   │   ├── AppShell.tsx   # Sidebar nav + course progress
│   │   │   ├── HomeView.tsx
│   │   │   ├── LessonView.tsx
│   │   │   ├── QuizView.tsx
│   │   │   ├── BlockRenderer.tsx   # Renders curriculum blocks (text, widget, formula, quiz…)
│   │   │   ├── math.tsx
│   │   │   └── widgets/       # ~35 interactive DL visualisations
│   │   │       ├── u1-*  (perceptron, backprop, GD, loss, K-Means, neuron, activation…)
│   │   │       ├── u2-*  (conv, pooling, batchnorm, dropout, architectures…)
│   │   │       ├── u3-*  (RNN, LSTM, GRU, BPTT, language model…)
│   │   │       └── u4-*  (autoencoder, VAE, GAN, RBM, DBN/DBM, entropy…)
│   │   └── ui/             # shadcn/ui components (accordion, button, dialog, etc.)
│   ├── data/
│   │   └── curriculum/     # u1.ts–u4.ts + index.ts (course content model)
│   ├── lib/
│   │   ├── store.ts        # Zustand progress store (persisted)
│   │   ├── db.ts           # Prisma client singleton
│   │   ├── content/types.ts# Content block types + unit themes
│   │   └── utils.ts        # cn() helper
│   ├── hooks/              # use-mobile, use-toast
│   └── theme-provider.tsx
├── prisma/
│   └── schema.prisma       # SQLite schema (User, Post)
├── .zscripts/              # Build/dev shell scripts (build.sh, dev.sh, start.sh, mini-services-*, python-runtime-*)
├── mini-services/          # Placeholder for future microservices (.gitkeep)
├── upload/                 # Course unit PDFs + .txt extracts (Unit 1–4)
├── tests/                  # Build/runtime test scripts
├── download/README.md
├── Caddyfile               # Reverse proxy :81 → :3000
├── next.config.ts          # standalone output, ignores TS build errors
├── tailwind.config.ts
├── postcss.config.mjs
├── components.json         # shadcn config
├── tsconfig.json
├── package.json
├── bun.lock
├── .env                    # DATABASE_URL (SQLite file path)
└── .gitignore
```

---

## Widgets at a glance

Each widget lives in `src/components/learn/widgets/` and is rendered inside `BlockRenderer` when a curriculum block has `type: "widget"`. All share the `WidgetFrame` chrome (title, description, unit accent colour).

| Unit | Widgets |
|------|---------|
| **U1** | `u1-ai-ml-dl`, `u1-neuron`, `u1-perceptron-lab`, `u1-and-training`, `u1-kmeans`, `u1-loss-lab`, `u1-activation-plot`, `u1-backprop-lab`, `u1-gd-lab` |
| **U2** | `u2-param-count`, `u2-conv-lab`, `u2-size-calc`, `u2-rf-lab`, `u2-pooling-lab`, `u2-train-loop`, `u2-init-lab`, `u2-batchnorm-lab`, `u2-dropout-lab`, `u2-arch-gallery` |
| **U3** | `u3-rnn-lab`, `u3-seq-patterns`, `u3-bptt-lab`, `u3-vanishing`, `u3-lstm-lab`, `u3-gru-lab`, `u3-lm-lab`, `u3-compare` |
| **U4** | `u4-model-map`, `u4-ae-lab`, `u4-vae-lab`, `u4-gan-lab`, `u4-entropy-lab`, `u4-rbm-lab`, `u4-dbn-dbm`, (+ ConvBM in U4-L8) |

---

## Scripts

| Script | Purpose |
|--------|---------|
| `bun run dev` | Start Next.js dev server on port 3000 (logs to `dev.log`) |
| `bun run build` | Production build (standalone output) |
| `bun run start` | Run the standalone production server |
| `bun run lint` | ESLint |
| `bun run db:generate` | Generate Prisma client |
| `bun run db:push` | Push Prisma schema to SQLite |
| `bun run db:migrate` | Prisma migrate dev |
| `bun run db:reset` | Prisma migrate reset |

---

## Deployment notes

- The app is configured for **standalone output** (`next.config.ts`), suitable for Docker/container deployment: `bun run build` then `bun run start`.
- A `Caddyfile` provides a reverse proxy on port 81 if you want to sit Caddy in front of the Next.js server.
- Course progress persists in the browser (`localStorage` key `dl-course-progress`); it is **not** tied to the Prisma database.
- The `db/custom.db` SQLite file and `.env` are part of the repo for convenience.

---

## Credits

Built from the **CCE3144 Deep Learning** course notes (Manipal University Jaipur) by **Dr. Manoj Kumar Sharma**. The four unit PDFs and their text extracts live in `upload/`.

---

## License

MIT License — see [LICENSE](LICENSE) for details.
