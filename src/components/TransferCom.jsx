import { useState, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';

function TransferCom() {
  const { account, provider } = useWeb3React();
  const [formData, setFormData] = useState({
    toAddress: '',
    amount: '',
    tokenType: 'ETH',
    inputData: ''
  });

  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTransfer = async (e) => {
    if (!account) {
      setError('请先连接钱包');
      return;
    }
    if (!formData.toAddress || !formData.amount) {
      setError('请填写完整的转账信息');
      return;
    }
    try {
      const signer = provider.getSigner();
      const amountInWei = ethers.parseEther(formData.amount);
      const data = ethers.toUtf8Bytes(formData.inputData);
      const transaction = {
        to: formData.toAddress,
        value: amountInWei,
        data: data
      };
      console.log('发送交易传参:', transaction);
      const tx = await signer.sendTransaction(transaction);

      setSuccess('交易已发送，请等待确认');
      setIsLoading(true);
      await tx.wait();
      setSuccess('交易已完成');
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="max-w-5xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg border">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">转账</h3>
      {error && <div className="text-red-500 text-center mb-4">{error}</div>}
      {success && <div className="text-green-500 text-center mb-4">{success}</div>}
      {isLoading && <div className="text-gray-500 text-center mb-4">交易中...</div>}
      <div className="flex flex-col items-start space-y-4">
        <div className="flex flex-row items-center justify-start space-x-4 w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2 w-40">转账金额:</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            placeholder="0.0"
            step="0.000001"
            min="0"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex flex-row items-center justify-start space-x-4 w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2 w-40">收款地址:</label>
          <input
            type="text"
            name="toAddress"
            value={formData.toAddress}
            onChange={handleInputChange}
            placeholder="0x..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <textarea
          name="inputData"
          value={formData.inputData}
          onChange={handleInputChange}
          placeholder="输入要写入区块链的数据..."
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <button className="px-4 py-2  font-normal bg-blue-600 text-white" onClick={handleTransfer}>
          转账
        </button>
      </div>
    </div>
  );
}

export default TransferCom;
