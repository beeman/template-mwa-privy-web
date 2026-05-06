import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import { z } from 'zod'

const browserBlockedRpcUrls = new Set(['https://api.mainnet-beta.solana.com'])

const emptyStringAsUndefined = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value

const viteDefaultServer = {
  allowedHosts: [],
  host: 'localhost',
  port: 5173,
} as const

const envSchema = z.object({
  VITE_PRIVY_APP_CLIENT_ID: z.string().trim().min(1, 'Required'),
  VITE_PRIVY_APP_ID: z.string().trim().min(1, 'Required'),
  VITE_SERVER_ALLOWED_HOSTS: z
    .preprocess(emptyStringAsUndefined, z.string().optional())
    .transform((value) =>
      value
        ? [
            ...new Set(
              value
                .split(',')
                .map((entry) => entry.trim())
                .filter(Boolean),
            ),
          ].sort((left, right) => left.localeCompare(right))
        : viteDefaultServer.allowedHosts,
    )
    .pipe(z.array(z.string().min(1))),
  VITE_SERVER_HOST: z.preprocess(emptyStringAsUndefined, z.string().optional()).transform((value) => {
    const host = value?.trim()

    if (!host) {
      return viteDefaultServer.host
    }

    return host.toLowerCase() === 'true' ? true : host
  }),
  VITE_SERVER_PORT: z.preprocess(
    emptyStringAsUndefined,
    z.coerce.number().int().min(1).max(65_535).default(viteDefaultServer.port),
  ),
  VITE_SOLANA_RPC_URL: z
    .string()
    .trim()
    .pipe(z.url('Must be a valid URL'))
    .refine((url) => !browserBlockedRpcUrls.has(url), {
      message: 'Must be a browser-accessible Solana RPC endpoint, not the public mainnet RPC',
    }),
})

function validateEnv(mode: string) {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const result = envSchema.safeParse(env)

  if (!result.success) {
    const issues = result.error.issues.map((issue) => `- ${issue.path.join('.')}: ${issue.message}`).join('\n')
    throw new Error(`Invalid Vite environment:\n${issues}`)
  }
  return result.data
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = validateEnv(mode)

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      allowedHosts: env.VITE_SERVER_ALLOWED_HOSTS,
      host: env.VITE_SERVER_HOST,
      port: env.VITE_SERVER_PORT,
    },
  }
})
