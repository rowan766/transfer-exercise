import { initializeConnector } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'

// 简化配置：只使用 MetaMask 连接器
export const [metaMask, metaMaskHooks] = initializeConnector(
  (actions) => new MetaMask({ actions })
)

// 导出连接器数组
export const connectors = [
  [metaMask, metaMaskHooks],
]

// 如果需要其他钱包，请先安装对应依赖并配置 API 密钥
// WalletConnect 和 Coinbase Wallet 需要额外的配置
/*
export const [walletConnect, walletConnectHooks] = initializeConnector(
  (actions) =>
    new WalletConnect({
      actions,
      options: {
        projectId: 'YOUR_WALLETCONNECT_PROJECT_ID',
        chains: [1, 5],
        showQrModal: true,
      },
    })
)

export const [coinbaseWallet, coinbaseWalletHooks] = initializeConnector(
  (actions) =>
    new CoinbaseWallet({
      actions,
      options: {
        url: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
        appName: 'My Web3 App',
      },
    })
)
*/