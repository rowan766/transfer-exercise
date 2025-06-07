import { Web3ReactProvider } from '@web3-react/core'
import { connectors } from './utils/connectors'
import WalletConnect from './components/WalletConnect'
import TransferCom from './components/TransferCom'

function App() {
  return (
    <Web3ReactProvider connectors={connectors}>
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
            Web3 React 应用
          </h1>
          <WalletConnect />
          <TransferCom></TransferCom>
        </div>
      </div>
    </Web3ReactProvider>
  )
}

export default App