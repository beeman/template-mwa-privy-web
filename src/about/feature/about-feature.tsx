import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/ui/card'

export function AboutFeature() {
  return (
    <div className="flex min-h-full w-full items-center justify-center px-4 py-10">
      <Card className="w-full max-w-3xl border-border/60">
        <CardHeader className="gap-2">
          <CardTitle className="text-xl font-semibold tracking-tight">About</CardTitle>
          <CardDescription className="max-w-2xl text-sm/6">
            Template Mwa Privy Web is a Privy Solana starter with wallet-only authentication and Solana Kit RPC clients.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
            <div className="text-sm font-medium">No email or social login</div>
            <div className="mt-1 text-xs/relaxed text-muted-foreground">
              The Privy modal is limited to wallet login.
            </div>
          </div>
          <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
            <div className="text-sm font-medium">Solana Kit</div>
            <div className="mt-1 text-xs/relaxed text-muted-foreground">
              RPC reads use <code className="font-mono">@solana/kit</code>.
            </div>
          </div>
          <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
            <div className="text-sm font-medium">Wallet actions</div>
            <div className="mt-1 text-xs/relaxed text-muted-foreground">
              Connect, create embedded wallets, read balances, and sign messages.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export { AboutFeature as Component }
