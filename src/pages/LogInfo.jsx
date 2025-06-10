import React, { useState, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';

// 简单的 GraphQL 查询函数
const querySubgraph = async (query, variables = {}) => {
  const response = await fetch('https://api.studio.thegraph.com/query/113496/my-contract/v0.0.1', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query,
      variables
    })
  });

  const result = await response.json();
  return result.data;
};

// 交易日志组件
const TransactionLogs = () => {
  const { account } = useWeb3React();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 获取所有交易日志
  const fetchLogs = async () => {
    setLoading(true);
    setError('');

    try {
      const query = `
      query {
        deposits(first: 20, orderBy: blockTimestamp, orderDirection: desc) {
          id
          Sender
          Value
          timestamp
          blockNumber
          transactionHash
        }
        receivedCalleds(first: 10, orderBy: blockNumber, orderDirection: desc) {
          id
          Sender
          Value
          blockNumber
          blockTimestamp
          transactionHash
        }
        fallbackCalleds(first: 10, orderBy: blockNumber, orderDirection: desc) {
          id
          Sender
          Value
          Data
          blockNumber
          blockTimestamp
          transactionHash
        }
      }
    `;

      const data = await querySubgraph(query);

      // 合并所有事件并排序
      const allLogs = [
        ...(data.deposits || []).map((item) => ({
          ...item,
          type: 'deposit',
          sender: item.Sender,
          value: item.Value,
          timestamp: item.timestamp || item.blockTimestamp
        })),
        ...(data.receivedCalleds || []).map((item) => ({
          ...item,
          type: 'receive',
          sender: item.Sender,
          value: item.Value,
          timestamp: item.blockTimestamp
        })),
        ...(data.fallbackCalleds || []).map((item) => ({
          ...item,
          type: 'fallback',
          sender: item.Sender,
          value: item.Value,
          data: item.Data,
          timestamp: item.blockTimestamp
        }))
      ].sort((a, b) => parseInt(b.blockNumber) - parseInt(a.blockNumber));

      setLogs(allLogs);
    } catch (err) {
      setError('查询失败，请稍后重试');
      console.error('查询错误:', err);
    } finally {
      setLoading(false);
    }
  };

  // 获取当前用户的交易日志
  const fetchMyLogs = async () => {
    if (!account) {
      alert('请先连接钱包');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const query = `
      query($sender: String!) {
        deposits(
          where: { Sender: $sender }
          orderBy: blockTimestamp
          orderDirection: desc
        ) {
          id
          Sender
          Value
          timestamp
          blockNumber
          transactionHash
        }
        fallbackCalleds(
          where: { Sender: $sender }
          orderBy: blockTimestamp
          orderDirection: desc
        ) {
          id
          Sender
          Value
          Data
          blockNumber
          blockTimestamp
          transactionHash
        }
      }
    `;

      const data = await querySubgraph(query, { sender: account });

      const myLogs = [
        ...(data.deposits || []).map((item) => ({
          ...item,
          type: 'my-deposit',
          sender: item.Sender,
          value: item.Value,
          timestamp: item.timestamp || item.blockTimestamp
        })),
        ...(data.fallbackCalleds || []).map((item) => ({
          ...item,
          type: 'my-fallback',
          sender: item.Sender,
          value: item.Value,
          data: item.Data,
          timestamp: item.blockTimestamp
        }))
      ].sort((a, b) => parseInt(b.blockNumber) - parseInt(a.blockNumber));

      setLogs(myLogs);
    } catch (err) {
      setError('查询失败，请稍后重试');
      console.error('查询错误:', err);
    } finally {
      setLoading(false);
    }
  };

  // 页面加载时获取数据
  useEffect(() => {
    fetchLogs();
  }, []);

  // 工具函数
  const formatEther = (wei) => {
    try {
      return parseFloat(ethers.utils.formatEther(wei)).toFixed(4);
    } catch {
      return '0';
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '-';
    return new Date(parseInt(timestamp) * 1000).toLocaleString('zh-CN');
  };

  const shortenAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const shortenHash = (hash) => {
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  // 获取事件类型样式
  const getEventTypeStyle = (type) => {
    switch (type) {
      case 'deposit':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'my-deposit':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'receive':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'fallback':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // 获取事件类型文本
  const getEventTypeText = (type) => {
    switch (type) {
      case 'deposit':
        return '存款';
      case 'my-deposit':
        return '我的存款';
      case 'receive':
        return 'Receive调用';
      case 'fallback':
        return 'Fallback调用';
      default:
        return '未知';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* 标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">合约交易日志</h1>
        <p className="text-gray-600">查看智能合约的所有交易事件和活动记录</p>
      </div>

      {/* 操作区域 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={fetchLogs}
              disabled={loading}
              className={`
                px-6 py-2.5 rounded-lg font-medium transition-all duration-200
                ${loading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'}
              `}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  查询中...
                </div>
              ) : (
                '查询合约日志'
              )}
            </button>

            <button
              onClick={fetchMyLogs}
              disabled={loading || !account}
              className={`
                px-6 py-2.5 rounded-lg font-medium transition-all duration-200
                ${loading || !account ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'}
              `}
            >
              查询我的日志
            </button>
          </div>

          {/* 统计信息 */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="bg-gray-100 px-3 py-1 rounded-full">共 {logs.length} 条记录</span>
          </div>
        </div>

        {/* 当前账户信息 */}
        {account && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">当前账户:</span>
              <span className="font-mono text-sm text-blue-600">{account}</span>
            </div>
          </div>
        )}
      </div>

      {/* 错误信息 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-red-700 font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* 交易日志列表 */}
      <div className="space-y-4">
        {logs.length === 0 && !loading && (
          <div className="bg-white rounded-lg border border-gray-200 p-12">
            <div className="text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无交易日志</h3>
              <p className="text-gray-500">点击上方按钮开始查询交易记录</p>
            </div>
          </div>
        )}

        {logs.map((log, index) => (
          <div key={`${log.type}-${log.id}-${index}`} className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-lg">
            <div className="p-6">
              {/* 事件类型标签 */}
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`
                  inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border
                  ${getEventTypeStyle(log.type)}
                `}
                >
                  {getEventTypeText(log.type)}
                </span>

                <div className="text-xs text-gray-500">区块 #{log.blockNumber}</div>
              </div>

              {/* 主要信息网格 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">发送者</label>
                  <div className="font-mono text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{shortenAddress(log.sender)}</div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">金额</label>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-blue-600">{formatEther(log.value)}</span>
                    <span className="text-sm text-gray-500">ETH</span>
                  </div>
                </div>

                {log.timestamp && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">时间</label>
                    <div className="text-sm text-gray-700">{formatTime(log.timestamp)}</div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">交易哈希</label>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${log.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <span className="font-mono text-sm">{shortenHash(log.transactionHash)}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>

                {log.data && (
                  <div className="md:col-span-2 lg:col-span-3 space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">调用数据</label>
                    <div className="font-mono text-xs text-gray-600 bg-gray-50 p-3 rounded-md break-all border">{log.data}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 底部提示 */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">温馨提示</h4>
            <p className="text-sm text-blue-700">数据可能存在延迟，点击"查询所有日志"获取最新数据。交易哈希可点击跳转到 Etherscan 查看详情。</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionLogs;
