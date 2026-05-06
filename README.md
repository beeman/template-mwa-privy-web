# template-mwa-privy-web

React 19 app with Vite, TypeScript, Tailwind CSS v4, Privy wallet-only Solana auth, Solana Kit RPC clients, and
shadcn/ui primitives.

## Features

- Includes a sample shadcn/ui button component
- Privy configured for wallet-only Sign in with Solana
- React 19 with Vite 7
- Solana Kit instead of Solana Web3.js
- System-aware light and dark theme support with persisted preference
- Tailwind CSS v4 and `tw-animate-css`
- TypeScript with strict checking

## Environment

```bash
VITE_PRIVY_APP_CLIENT_ID=
VITE_PRIVY_APP_ID=
VITE_SOLANA_RPC_URL=
```

Set `VITE_SOLANA_RPC_URL` to a browser-accessible mainnet RPC endpoint. The public mainnet RPC is not usable from
browsers. Enable wallet login in the Privy Dashboard for the app ID. Email, SMS, and social login methods are not
enabled in the client config.

## Development

```bash
bun install
bun run dev
```

Open `http://localhost:5173` to view the app.

## Commands

```bash
bun run build
bun run ci
bun run lint
bun run lint:fix
bun run preview
bun run typecheck
```

## Adding Components

Use the shadcn CLI to scaffold more UI primitives:

```bash
bunx --bun shadcn@latest add button
```

Generated components are written to `src/components/ui`.

## Usage

Import components from the `@/core/ui` alias:

```tsx
import { Button } from '@/core/ui/button'
```
