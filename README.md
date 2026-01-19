# R3ASON - Automated Claim Intelligence

**R3ASON** is a multimodal reasoning engine powered by Groq (Llama 3.3). It analyzes claims in text and images (limited), detecting logical fallacies, statistical errors, and missing context.

## Deployment

This is a [Next.js](https://nextjs.org/) project.

### 1. Environment Variables
You must set `GROQ_API_KEY` in your environment variables.
```bash
GROQ_API_KEY=gsk_...
```

### 2. Build & Run
```bash
npm install
npm run build
npm start
```

## Features
- **High-Speed Reasoning**: Powered by Groq LPU inference.
- **Strict Logic**: Enforces structured JSON output for verifiable reasoning.
- **Frontend**: Premium Tailwind/Framer Motion UI.
