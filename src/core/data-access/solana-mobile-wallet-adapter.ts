import {
  createDefaultAuthorizationCache,
  createDefaultChainSelector,
  createDefaultWalletNotFoundHandler,
  registerMwa,
} from '@solana-mobile/wallet-standard-mobile'

export function solanaMobileWalletAdapter({
  appIdentity,
  chains,
}: {
  appIdentity: { icon?: string; name?: string; uri?: string }
  chains: `${string}:${string}`[]
}) {
  if (typeof window === 'undefined') {
    return
  }
  if (!window.isSecureContext) {
    console.warn(`Solana Mobile Wallet Adapter not loaded: https connection required`)
    return
  }
  registerMwa({
    appIdentity,
    authorizationCache: createDefaultAuthorizationCache(),
    chains,
    chainSelector: createDefaultChainSelector(),
    onWalletNotFound: createDefaultWalletNotFoundHandler(),
  })
  console.log(`Loaded Solana Mobile Wallet Adapter`)
}
