import { Web3ReactProvider } from '@web3-react/core';
import { connectors } from './utils/connectors';
import WalletConnect from './components/WalletConnect';
import TransferCom from './components/TransferCom';
import HexTransformStr from './components/HexTransformStr';

import LogInfo from './pages/LogInfo'

function App() {
  return (
    <Web3ReactProvider connectors={connectors}>
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <span className="text-4xl font-bold text-center mb-8 text-gray-400">转账练习</span>
          <WalletConnect />
          <TransferCom></TransferCom>
          <HexTransformStr></HexTransformStr>
          <LogInfo></LogInfo>
        </div>
      </div>
    </Web3ReactProvider>
  );
}

export default App;
