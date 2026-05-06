import type { PrivyClientConfig } from '@privy-io/react-auth'

import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana'
import { createSolanaRpc, mainnet } from '@solana/kit'

import { solanaMobileWalletAdapter } from '@/core/data-access/solana-mobile-wallet-adapter'

export interface AppConfig {
  privy: { appId: string; clientId: string; config: PrivyClientConfig }
  solanaRpcUrl: string
}

export const appConfig: AppConfig = {
  privy: {
    appId: import.meta.env['VITE_PRIVY_APP_ID'],
    clientId: import.meta.env['VITE_PRIVY_APP_CLIENT_ID'],
    config: {
      appearance: {
        landingHeader: 'Connect Solana wallet',
        showWalletLoginFirst: true,
        walletChainType: 'solana-only',
        walletList: ['backpack', 'detected_solana_wallets', 'phantom', 'jupiter', 'solflare'],
      },
      embeddedWallets: {
        solana: {
          createOnLogin: 'off',
        },
      },
      externalWallets: {
        solana: {
          connectors: toSolanaWalletConnectors({
            shouldAutoConnect: false,
          }),
        },
      },
      loginMethods: ['wallet'],
    },
  },
  solanaRpcUrl: import.meta.env['VITE_SOLANA_RPC_URL'],
}

export const isPrivyConfigured = Boolean(appConfig.privy.appId) && Boolean(appConfig.privy.clientId)

export const solanaRpc = createSolanaRpc(mainnet(appConfig.solanaRpcUrl))

solanaMobileWalletAdapter({
  appIdentity: { name: 'Template Mwa Privy Web' },
  chains: ['solana:mainnet'],
})
