import { useWeb3React } from '@web3-react/core'
import { metaMask } from '../utils/connectors'
import { useEffect, useState } from 'react'
import { getBalance, getNetworkInfo } from '../utils/providerUtils'

function WalletConnect() {
  const { connector, account, isActive, provider, chainId } = useWeb3React()
  const [balance, setBalance] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchBalance = async () => {
      if (isActive && provider && account) {
        try {
          setLoading(true)
          setError(null)
          
          const balanceFormatted = await getBalance(provider, account)
          setBalance(balanceFormatted)
        } catch (err) {
          console.error('获取余额失败:', err)
          setError('获取余额失败: ' + err.message)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchBalance()
  }, [isActive, provider, account])

  const connectWallet = async () => {
    try {
      setError(null)
      setLoading(true)
      await metaMask.activate()
    } catch (error) {
      console.error('连接钱包失败:', error)
      setError('连接钱包失败，请确保已安装 MetaMask: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const disconnect = () => {
    try {
      setBalance(null)
      setError(null)
      if (metaMask?.deactivate) {
        metaMask.deactivate()
      } else {
        metaMask.resetState()
      }
    } catch (error) {
      console.error('断开连接失败:', error)
      setError('断开连接失败: ' + error.message)
    }
  }

  const getNetworkName = (chainId) => {
    const networkInfo = getNetworkInfo(chainId)
    return networkInfo.name
  }

  // 重试获取余额
  const retryBalance = async () => {
    if (isActive && provider && account) {
      try {
        setLoading(true)
        setError(null)
        
        const balanceFormatted = await getBalance(provider, account)
        setBalance(balanceFormatted)
      } catch (err) {
        console.error('重试获取余额失败:', err)
        setError('获取余额失败，请尝试切换网络或重新连接钱包')
      } finally {
        setLoading(false)
      }
    }
  }

  if (error && !isActive) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-red-600 text-center mb-4">
          <h3 className="font-semibold mb-2">连接错误</h3>
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={() => {
            setError(null)
            connectWallet()
          }}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition duration-200"
          disabled={loading}
        >
          {loading ? '连接中...' : '重新连接'}
        </button>
      </div>
    )
  }

  if (isActive) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4 text-green-600">钱包已连接</h2>
        <div className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">网络</div>
            <div className="font-semibold">{getNetworkName(chainId)}</div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">地址：{account}</div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">余额</div>
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                <span className="text-sm">加载中...</span>
              </div>
            ) : error ? (
              <div>
                <div className="text-red-600 text-sm mb-2">{error}</div>
                <button
                  onClick={retryBalance}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  重试获取余额
                </button>
              </div>
            ) : balance !== null ? (
              <div className="font-semibold">{parseFloat(balance).toFixed(4)} ETH</div>
            ) : (
              <div className="text-gray-500 text-sm">无法获取余额</div>
            )}
          </div>
          
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
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              连接中...
            </>
          ) : (
            <>
              <img 
                src="https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg" 
                alt="MetaMask" 
                className="w-6 h-6 mr-2"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
              连接 MetaMask
            </>
          )}
        </button>
        <p className="text-sm text-gray-500 text-center">
          请确保已安装 MetaMask 浏览器扩展
        </p>
      </div>
    </div>
  )
}

export default WalletConnect