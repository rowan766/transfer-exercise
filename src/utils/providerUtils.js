// src/utils/providerUtils.js
import { BrowserProvider, formatEther } from 'ethers';

/**
 * 创建兼容的 ethers provider
 */
export const createEthersProvider = (provider) => {
  try {
    // 如果已经是 ethers provider
    if (provider && provider.getBalance && provider.getSigner) {
      return provider;
    }

    // web3-react 包装的 provider
    if (provider && provider.provider) {
      return new BrowserProvider(provider.provider);
    }

    // 原始的 MetaMask provider
    if (provider && provider.request) {
      return new BrowserProvider(provider);
    }

    // 如果是 window.ethereum
    if (typeof window !== 'undefined' && window.ethereum) {
      return new BrowserProvider(window.ethereum);
    }

    throw new Error('无法创建有效的 provider');
  } catch (error) {
    console.error('创建 provider 失败:', error);
    throw error;
  }
};

/**
 * 安全地获取余额
 */
export const getBalance = async (provider, address) => {
  try {
    // 方法 1: 使用 ethers provider
    const ethersProvider = createEthersProvider(provider);
    const balanceWei = await ethersProvider.getBalance(address);
    return formatEther(balanceWei);
  } catch (error) {
    console.warn('ethers 方法失败，尝试降级方案:', error);

    try {
      // 方法 2: 直接使用原始 provider
      const balanceWei = await provider.getBalance(address);
      return formatEther(balanceWei);
    } catch (error2) {
      console.warn('原始 provider 方法失败，尝试手动计算:', error2);

      try {
        // 方法 3: 手动计算，不使用 formatEther
        const balanceWei = await provider.getBalance(address);
        const balanceNum = typeof balanceWei === 'bigint' ? Number(balanceWei) : Number(balanceWei.toString());

        const balanceEth = balanceNum / 1e18;
        return balanceEth.toFixed(6);
      } catch (error3) {
        console.error('所有方法都失败:', error3);
        throw new Error('无法获取余额');
      }
    }
  }
};

/**
 * 获取网络信息
 */
export const getNetworkInfo = (chainId) => {
  const networks = {
    1: { name: '以太坊主网', symbol: 'ETH', explorer: 'https://etherscan.io' },
    5: { name: 'Goerli 测试网', symbol: 'ETH', explorer: 'https://goerli.etherscan.io' },
    11155111: { name: 'Sepolia 测试网', symbol: 'ETH', explorer: 'https://sepolia.etherscan.io' },
    137: { name: 'Polygon 主网', symbol: 'MATIC', explorer: 'https://polygonscan.com' },
    80001: { name: 'Mumbai 测试网', symbol: 'MATIC', explorer: 'https://mumbai.polygonscan.com' },
    56: { name: 'BSC 主网', symbol: 'BNB', explorer: 'https://bscscan.com' },
    97: { name: 'BSC 测试网', symbol: 'BNB', explorer: 'https://testnet.bscscan.com' }
  };

  return (
    networks[chainId] || {
      name: `网络 ${chainId}`,
      symbol: 'ETH',
      explorer: '#'
    }
  );
};
