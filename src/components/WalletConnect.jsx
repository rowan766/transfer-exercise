import { useState, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import { metaMask } from '../utils/connectors';
import { ethers } from 'ethers';

function WalletConnect() {
  const { account, isActive, provider, chainId } = useWeb3React();

  const [balance, setBalance] = useState('0');

  useEffect(() => {
    console.log('连接状态:', isActive);
    console.log('当前账户:', account);
    console.log('当前网络:', chainId);
  }, [isActive, account, chainId]);

  // 连接钱包
  const connectWallet = async () => {
    // connect wallet logic here
    const connectMetaMask = () => metaMask.activate();

    await connectMetaMask();
    console.log('connected to metamask');
  };

  const fetchBalance = async () => {
    if (!account) return;

    const workingRPCs = ['https://sepolia.gateway.tenderly.co', 'https://rpc2.sepolia.org'];

    for (const rpcUrl of workingRPCs) {
      try {
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const balanceWei = await provider.getBalance(account);
        const balanceEth = ethers.formatEther(balanceWei);

        console.log(`使用 ${rpcUrl} 获取余额成功:`, balanceEth);
        setBalance(balanceEth);
        return; // 成功就退出
      } catch (error) {
        console.warn(`${rpcUrl} 失败，尝试下一个`);
        continue;
      }
    }

    console.error('所有可用 RPC 都失败了');
    setBalance('0.0000');
  };

  useEffect(() => {
    if (isActive) {
      fetchBalance();
    }
  }, [isActive, account, provider]);

  // 断开连接
  const disconnectWallet = async () => {
    try {
      metaMask.actions.resetState();
      console.log('MetaMask 连接已断开');
    } catch (error) {
      console.error('断开连接失败:', error);
    }
  };

  return (
    <div className="wallet-connect">
      {!isActive ? (
        <button className="wallet-connect__button w-24 h-12 bg-blue-500 text-white  rounded-lg" onClick={connectWallet}>
          连接钱包
        </button>
      ) : (
        <div>
          <p>
            已连接: {account} ({balance} ETH)
          </p>
          <button className="wallet-connect__button w-24 h-12 bg-red-500 text-white  rounded-lg" onClick={disconnectWallet}>
            断开连接
          </button>
        </div>
      )}
    </div>
  );
}

export default WalletConnect;
