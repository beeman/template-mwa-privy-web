import type { ConnectedStandardSolanaWallet } from '@privy-io/react-auth/solana'

import { usePrivy } from '@privy-io/react-auth'
import { useCreateWallet, useSignMessage, useWallets } from '@privy-io/react-auth/solana'
import { address } from '@solana/kit'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CheckCircle2Icon,
  Loader2Icon,
  LogInIcon,
  LogOutIcon,
  PlusIcon,
  RefreshCwIcon,
  SignatureIcon,
  WalletIcon,
  XCircleIcon,
} from 'lucide-react'
import { useMemo } from 'react'

import { appConfig, solanaRpc } from '@/core/data-access/app-config'
import { Badge } from '@/core/ui/badge'
import { Button } from '@/core/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/ui/card'

const LAMPORTS_PER_SOL = 1_000_000_000n

interface ActionResult {
  error?: unknown
  message?: string
  signature?: string
  updatedAt: number
}

export function DemoFeature() {
  return <PrivySolanaDashboard />
}

function formatAddress(value: string) {
  return `${value.slice(0, 4)}...${value.slice(-4)}`
}

function formatBytes(value: Uint8Array) {
  return Array.from(value)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

function formatError(error: unknown) {
  return error instanceof Error ? error.message : 'The request could not be completed.'
}

function formatSol(lamports: bigint) {
  const fraction = (lamports % LAMPORTS_PER_SOL).toString().padStart(9, '0').replace(/0+$/, '')
  const whole = lamports / LAMPORTS_PER_SOL

  return `${whole}${fraction ? `.${fraction}` : ''} SOL`
}

function getWalletName(wallet: ConnectedStandardSolanaWallet) {
  return wallet.standardWallet.name || 'Solana wallet'
}

function PrivySolanaDashboard() {
  const { authenticated, connectWallet, login, logout, ready, user } = usePrivy()
  const { createWallet } = useCreateWallet()
  const queryClient = useQueryClient()
  const { ready: walletsReady, wallets } = useWallets()
  const { signMessage } = useSignMessage()

  const sortedWallets = useMemo(
    () =>
      [...wallets].sort(
        (left, right) =>
          getWalletName(left).localeCompare(getWalletName(right)) || left.address.localeCompare(right.address),
      ),
    [wallets],
  )
  const privyWallet = sortedWallets.find((wallet) => wallet.standardWallet.name === 'Privy')
  const selectedWallet = privyWallet ?? sortedWallets[0]

  const balanceQuery = useQuery({
    enabled: false,
    queryFn: async ({ queryKey }) => {
      const [, walletAddress] = queryKey

      if (!walletAddress) {
        throw new Error('Connect a wallet first.')
      }

      const response = await solanaRpc.getBalance(address(walletAddress)).send()

      return formatSol(response.value)
    },
    queryKey: ['solanaBalance', selectedWallet?.address ?? null],
  })

  const createWalletMutation = useMutation({
    mutationFn: async () => {
      const { wallet } = await createWallet()

      return `Created embedded wallet ${formatAddress(wallet.address)}.`
    },
  })

  const disconnectWalletMutation = useMutation({
    mutationFn: async (wallet: ConnectedStandardSolanaWallet) => {
      await wallet.disconnect()

      return `Disconnected ${formatAddress(wallet.address)}.`
    },
    onSuccess: (_message, wallet) => {
      queryClient.removeQueries({ queryKey: ['solanaBalance', wallet.address] })
    },
  })

  const signMessageMutation = useMutation({
    mutationFn: async (wallet: ConnectedStandardSolanaWallet) => {
      const message = new TextEncoder().encode(`template-mwa-privy-web:${new Date().toISOString()}`)
      const result = await signMessage({
        message,
        wallet,
      })

      return {
        message: `Signed with ${formatAddress(wallet.address)}.`,
        signature: formatBytes(result.signature),
      }
    },
  })

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await logout()

      return 'Logged out.'
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['solanaBalance'] })
      signMessageMutation.reset()
    },
  })

  const actionResults: Array<ActionResult | null> = [
    balanceQuery.error ? { error: balanceQuery.error, updatedAt: balanceQuery.errorUpdatedAt } : null,
    createWalletMutation.data
      ? { message: createWalletMutation.data, updatedAt: createWalletMutation.submittedAt }
      : null,
    createWalletMutation.error
      ? { error: createWalletMutation.error, updatedAt: createWalletMutation.submittedAt }
      : null,
    disconnectWalletMutation.data
      ? { message: disconnectWalletMutation.data, updatedAt: disconnectWalletMutation.submittedAt }
      : null,
    disconnectWalletMutation.error
      ? { error: disconnectWalletMutation.error, updatedAt: disconnectWalletMutation.submittedAt }
      : null,
    logoutMutation.data ? { message: logoutMutation.data, updatedAt: logoutMutation.submittedAt } : null,
    logoutMutation.error ? { error: logoutMutation.error, updatedAt: logoutMutation.submittedAt } : null,
    signMessageMutation.data
      ? {
          message: signMessageMutation.data.message,
          signature: signMessageMutation.data.signature,
          updatedAt: signMessageMutation.submittedAt,
        }
      : null,
    signMessageMutation.error ? { error: signMessageMutation.error, updatedAt: signMessageMutation.submittedAt } : null,
  ]

  const actionResult = actionResults
    .filter((result): result is ActionResult => Boolean(result))
    .sort((left, right) => right.updatedAt - left.updatedAt)[0]

  const disconnectingWalletAddress = disconnectWalletMutation.variables?.address

  return (
    <div className="min-h-full w-full bg-muted px-4 py-4 sm:px-6 sm:py-6 lg:px-12 lg:py-10 dark:bg-background">
      <div className="mx-auto grid max-w-5xl gap-4 lg:grid-cols-[1fr_22rem]">
        <section className="grid gap-4">
          <Card className="border-border/60">
            <CardHeader className="gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={authenticated ? 'default' : 'secondary'}>
                  {authenticated ? <CheckCircle2Icon /> : <XCircleIcon />}
                  {authenticated ? 'Authenticated' : 'Signed out'}
                </Badge>
                <Badge variant={walletsReady ? 'outline' : 'secondary'}>
                  {walletsReady ? <CheckCircle2Icon /> : <Loader2Icon className="animate-spin" />}
                  Wallets {walletsReady ? 'ready' : 'loading'}
                </Badge>
              </div>
              <div>
                <CardTitle className="text-2xl font-semibold tracking-tight">Solana Wallet Login</CardTitle>
                <CardDescription className="mt-1 text-sm/6">
                  Privy is configured for wallet-only Sign in with Solana.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button
                disabled={!ready || authenticated}
                onClick={() =>
                  login({
                    loginMethods: ['wallet'],
                    walletChainType: 'solana-only',
                  })
                }
              >
                <LogInIcon />
                Log in
              </Button>
              <Button
                disabled={!ready || !authenticated}
                onClick={() => connectWallet(appConfig.privy.config.appearance)}
                variant="outline"
              >
                <WalletIcon />
                Connect
              </Button>
              <Button
                disabled={!authenticated || logoutMutation.isPending}
                onClick={() => logoutMutation.mutate()}
                variant="outline"
              >
                {logoutMutation.isPending ? <Loader2Icon className="animate-spin" /> : <LogOutIcon />}
                Log out
              </Button>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Wallets</CardTitle>
                <CardDescription className="text-xs/relaxed">{sortedWallets.length} connected</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                {sortedWallets.length ? (
                  sortedWallets.map((wallet) => (
                    <div className="grid gap-2 rounded-md border border-border/60 bg-muted/20 p-3" key={wallet.address}>
                      <div className="flex min-w-0 items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">{getWalletName(wallet)}</div>
                          <div className="truncate font-mono text-xs text-muted-foreground">{wallet.address}</div>
                        </div>
                        <Button
                          aria-label={`Disconnect ${getWalletName(wallet)}`}
                          disabled={disconnectWalletMutation.isPending}
                          onClick={() => disconnectWalletMutation.mutate(wallet)}
                          size="icon-sm"
                          variant="ghost"
                        >
                          {disconnectWalletMutation.isPending && disconnectingWalletAddress === wallet.address ? (
                            <Loader2Icon className="animate-spin" />
                          ) : (
                            <LogOutIcon />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
                    No Solana wallet connected.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Actions</CardTitle>
                <CardDescription className="text-xs/relaxed">
                  {selectedWallet ? formatAddress(selectedWallet.address) : 'Connect a wallet first'}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2">
                <Button
                  disabled={!authenticated || createWalletMutation.isPending}
                  onClick={() => createWalletMutation.mutate()}
                  variant="outline"
                >
                  {createWalletMutation.isPending ? <Loader2Icon className="animate-spin" /> : <PlusIcon />}
                  Embedded wallet
                </Button>
                <Button
                  disabled={!selectedWallet || balanceQuery.isFetching}
                  onClick={() => void balanceQuery.refetch()}
                >
                  {balanceQuery.isFetching ? <Loader2Icon className="animate-spin" /> : <RefreshCwIcon />}
                  Refresh balance
                </Button>
                <Button
                  disabled={!selectedWallet || signMessageMutation.isPending}
                  onClick={() => selectedWallet && signMessageMutation.mutate(selectedWallet)}
                  variant="secondary"
                >
                  {signMessageMutation.isPending ? <Loader2Icon className="animate-spin" /> : <SignatureIcon />}
                  Sign message
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        <aside className="grid content-start gap-4">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Session</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <div>
                <div className="text-xs font-medium text-muted-foreground">App ID</div>
                <div className="mt-1 font-mono text-xs">{formatAddress(appConfig.privy.appId ?? '')}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground">Balance</div>
                <div className="mt-1 font-mono text-xs">{balanceQuery.data ?? 'Not loaded'}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground">Network</div>
                <div className="mt-1 font-mono text-xs">solana:mainnet</div>
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground">User</div>
                <div className="mt-1 truncate font-mono text-xs">{user?.id ?? 'Not authenticated'}</div>
              </div>
            </CardContent>
          </Card>

          {actionResult && (
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Result</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm">
                {actionResult.error ? (
                  <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-destructive">
                    {formatError(actionResult.error)}
                  </div>
                ) : null}
                {actionResult.signature ? (
                  <div className="rounded-md border border-border/60 bg-muted/30 p-3 font-mono text-xs break-all">
                    {actionResult.signature}
                  </div>
                ) : null}
                {actionResult.message ? (
                  <div className="rounded-md border border-border/60 bg-muted/30 p-3 text-xs">
                    {actionResult.message}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}
        </aside>
      </div>
    </div>
  )
}

export { DemoFeature as Component }
