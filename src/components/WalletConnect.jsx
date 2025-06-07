import { useWeb3React } from '@web3-react/core'
import { metaMask } from '../utils/connectors'
import { useEffect, useState } from 'react'
import { formatEther } from 'ethers'

function WalletConnect() {
  const { connector, account, isActive, provider, chainId } = useWeb3React()
  const [balance, setBalance] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isActive && provider && account) {
      provider.getBalance(account)
        .then((balance) => {
          setBalance(formatEther(balance))
        })
        .catch((err) => {
          console.error('获取余额失败:', err)
          setError('获取余额失败')
        })
    }
  }, [isActive, provider, account])

  const connectWallet = async () => {
    try {
      setError(null)
      await metaMask.activate()
    } catch (error) {
      console.error('连接钱包失败:', error)
      setError('连接钱包失败，请确保已安装 MetaMask')
    }
  }

  const disconnect = () => {
    try {
      if (metaMask?.deactivate) {
        metaMask.deactivate()
      } else {
        metaMask.resetState()
      }
    } catch (error) {
      console.error('断开连接失败:', error)
    }
  }

  const getNetworkName = (chainId) => {
    switch (chainId) {
      case 1: return '以太坊主网'
      case 5: return 'Goerli 测试网'
      case 11155111: return 'Sepolia 测试网'
      case 137: return 'Polygon'
      default: return `网络 ${chainId}`
    }
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-red-600 text-center mb-4">
          <p>{error}</p>
        </div>
        <button
          onClick={() => setError(null)}
          className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition duration-200"
        >
          重试
        </button>
      </div>
    )
  }

  if (isActive) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4 text-green-600">钱包已连接</h2>
        <div className="space-y-3">
          <div>
            <span className="text-gray-600">网络:</span>
            <p className="font-semibold">{getNetworkName(chainId)}</p>
          </div>
          <div>
            <span className="text-gray-600">地址:</span>
            <p className="font-mono text-sm break-all bg-gray-100 p-2 rounded">
              {account}
            </p>
          </div>
          {balance !== null && (
            <div>
              <span className="text-gray-600">余额:</span>
              <p className="font-semibold">{parseFloat(balance).toFixed(4)} ETH</p>
            </div>
          )}
          <button
            onClick={disconnect}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition duration-200"
          >
            断开连接
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4 text-center">连接钱包</h2>
      <div className="space-y-3">
        <button
          onClick={connectWallet}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded transition duration-200 flex items-center justify-center"
        >
          <img 
            src="https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg" 
            alt="MetaMask" 
            className="w-6 h-6 mr-2"
          />
          连接 MetaMask
        </button>
        <p className="text-sm text-gray-500 text-center">
          请确保已安装 MetaMask 浏览器扩展
        </p>
      </div>
    </div>
  )
}

export default WalletConnect