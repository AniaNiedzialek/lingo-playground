# Lingo Playground

A single-page web app for practicing Spanish verb conjugation across the past, present, and future tenses.

**Live demo:** https://lingo-playground.vercel.app

## What it does

Presents a verb and a tense, asks you to conjugate it across all six persons, and validates each answer in real time. Progress is tracked across sessions.

- **Rule-based conjugation** — forms are generated from the verb's ending (`-ar`, `-er`, `-ir`) rather than stored in a lookup table, with per-verb irregular overrides taking precedence over the regular rules.
- **Accent-sensitive validation** — comparison is case-insensitive but diacritic-sensitive, so `hablo` and `habló` are treated as different answers. A custom accent pad lets you enter á, é, í, ó, ú, and ñ without changing keyboard layout.
- **Persistent progress** — correct/total counts are stored in `localStorage` behind a defensive load layer that validates parsed JSON, range-checks numeric fields with `Number.isFinite`, and falls back to safe defaults when stored data is corrupt or storage is unavailable.

## Stack

React 18, Vite, Tailwind CSS, React Router, Framer Motion, and Vanta/Three.js for the animated background.

## Project layout

```
spanish-tenses/
├── src/
│   ├── pages/          Home, Past, Present, Future
│   ├── components/     AccentPad and shared UI
│   ├── utils/          storage.js (persistence), celebrate.js (feedback animation)
│   ├── App.jsx         routing
│   └── main.jsx        entry point
└── package.json
```

## Running locally

```bash
cd spanish-tenses
npm install
npm run dev
```

Then open the URL Vite prints, usually http://localhost:5173.

Other scripts:

```bash
npm run build     # production build
npm run preview   # serve the production build
npm run lint      # eslint
```

## Deployment

Deployed on Vercel from the `spanish-tenses` directory.
