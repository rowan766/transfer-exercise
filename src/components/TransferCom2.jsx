import { useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { ethers } from 'ethers'

function TransferCom() {
    const { account, provider } = useWeb3React()
    const [formData, setFormData] = useState({
        toAddress: '',
        amount: '',
        tokenType: 'ETH',
        inputData: '' // 新增：输入数据字段
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    // 处理输入变化
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        // 清除之前的错误和成功消息
        setError('')
        setSuccess('')
    }

    // 验证地址格式
    const isValidAddress = (address) => {
        try {
            ethers.getAddress(address)
            return true
        } catch {
            return false
        }
    }

    // 字符串转十六进制
    const stringToHex = (str) => {
        if (!str) return '0x'
        
        try {
            // 将字符串转换为 UTF-8 字节，然后转为十六进制
            const encoder = new TextEncoder()
            const bytes = encoder.encode(str)
            const hex = Array.from(bytes)
                .map(byte => byte.toString(16).padStart(2, '0'))
                .join('')
            return '0x' + hex
        } catch (err) {
            console.error('字符串转十六进制失败:', err)
            return '0x'
        }
    }

    // 十六进制转字符串（用于预览）
    const hexToString = (hex) => {
        if (!hex || hex === '0x') return ''
        
        try {
            // 移除 0x 前缀
            const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex
            
            // 检查是否为有效的十六进制
            if (!/^[0-9a-fA-F]*$/.test(cleanHex) || cleanHex.length % 2 !== 0) {
                return '无效的十六进制数据'
            }
            
            // 转换为字节数组
            const bytes = new Uint8Array(cleanHex.match(/.{2}/g).map(byte => parseInt(byte, 16)))
            
            // 解码为字符串
            const decoder = new TextDecoder('utf-8')
            return decoder.decode(bytes)
        } catch (err) {
            return '解码失败'
        }
    }

    // 获取转换后的十六进制数据
    const getHexData = () => {
        if (!formData.inputData.trim()) return '0x'
        
        // 如果用户输入的已经是十六进制格式，直接使用
        if (formData.inputData.startsWith('0x')) {
            return formData.inputData
        }
        
        // 否则将字符串转换为十六进制
        return stringToHex(formData.inputData)
    }

    // 处理转账
    const handleTransfer = async () => {
        if (!account) {
            setError('请先连接钱包')
            return
        }

        if (!formData.toAddress || !formData.amount) {
            setError('请填写完整的转账信息')
            return
        }

        if (!isValidAddress(formData.toAddress)) {
            setError('收件人地址格式不正确')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            const signer = provider.getSigner()
            
            // 转换金额为 Wei
            const amountInWei = ethers.parseEther(formData.amount)
            
            // 获取十六进制数据
            const hexData = getHexData()

            // 创建交易对象
            const transaction = {
                to: formData.toAddress,
                value: amountInWei,
                data: hexData, // 添加数据字段
                gasLimit: 21000 + (hexData.length > 2 ? Math.ceil((hexData.length - 2) / 2) * 68 : 0), // 根据数据长度调整gas
            }

            console.log('发送交易:', transaction)

            // 发送交易
            const tx = await signer.sendTransaction(transaction)
            
            setSuccess(`转账已发送！交易哈希: ${tx.hash}`)
            
            // 等待交易确认
            await tx.wait()
            setSuccess(`转账成功！交易已确认: ${tx.hash}`)
            
            // 清空表单
            setFormData({
                toAddress: '',
                amount: '',
                tokenType: 'ETH',
                inputData: ''
            })

        } catch (err) {
            console.error('转账失败:', err)
            if (err.code === 'ACTION_REJECTED') {
                setError('用户取消了交易')
            } else if (err.code === 'INSUFFICIENT_FUNDS') {
                setError('余额不足')
            } else {
                setError(`转账失败: ${err.message}`)
            }
        } finally {
            setIsLoading(false)
        }
    }

    const hexData = getHexData()

    return (
        <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg border">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">转账</h2>
            
            {/* 收件人地址输入 */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    收件人地址
                </label>
                <input
                    type="text"
                    name="toAddress"
                    value={formData.toAddress}
                    onChange={handleInputChange}
                    placeholder="0x..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* 转账金额输入 */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    转账金额
                </label>
                <div className="flex">
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
                    <select
                        name="tokenType"
                        value={formData.tokenType}
                        onChange={handleInputChange}
                        className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="ETH">ETH</option>
                        <option value="USDC" disabled>USDC (即将支持)</option>
                        <option value="USDT" disabled>USDT (即将支持)</option>
                    </select>
                </div>
            </div>

            {/* 新增：输入数据字段 */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    输入数据 (可选)
                </label>
                <textarea
                    name="inputData"
                    value={formData.inputData}
                    onChange={handleInputChange}
                    placeholder="输入要写入区块链的数据..."
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                    支持文本或十六进制格式 (0x开头)
                </p>
            </div>

            {/* 数据预览 */}
            {formData.inputData && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm font-medium text-blue-800 mb-2">数据预览:</p>
                    <div className="space-y-2">
                        <div>
                            <p className="text-xs text-blue-600">十六进制格式:</p>
                            <p className="text-xs font-mono text-blue-700 break-all bg-white p-2 rounded border">
                                {hexData}
                            </p>
                        </div>
                        {!formData.inputData.startsWith('0x') && (
                            <div>
                                <p className="text-xs text-blue-600">原始文本:</p>
                                <p className="text-xs text-blue-700 bg-white p-2 rounded border">
                                    {formData.inputData}
                                </p>
                            </div>
                        )}
                        {formData.inputData.startsWith('0x') && (
                            <div>
                                <p className="text-xs text-blue-600">解码文本:</p>
                                <p className="text-xs text-blue-700 bg-white p-2 rounded border">
                                    {hexToString(formData.inputData)}
                                </p>
                            </div>
                        )}
                        <p className="text-xs text-blue-500">
                            数据长度: {hexData.length > 2 ? (hexData.length - 2) / 2 : 0} 字节
                        </p>
                    </div>
                </div>
            )}

            {/* 当前账户信息 */}
            {account && (
                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-600">
                        <span className="font-medium">发送地址:</span>
                    </p>
                    <p className="text-xs text-gray-500 break-all">{account}</p>
                </div>
            )}

            {/* 错误消息 */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {/* 成功消息 */}
            {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-600 break-all">{success}</p>
                </div>
            )}

            {/* 转账按钮 */}
            <button
                onClick={handleTransfer}
                disabled={!account || isLoading}
                className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                    !account || isLoading
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                }`}
            >
                {isLoading ? (
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        转账中...
                    </div>
                ) : !account ? (
                    '请先连接钱包'
                ) : (
                    '发送转账'
                )}
            </button>

            {/* 提示信息 */}
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-xs text-yellow-700">
                    <strong>注意:</strong> 请仔细核对收件人地址，转账一旦发送将无法撤回。添加数据会增加 Gas 费用。
                </p>
            </div>
        </div>
    )
}

export default TransferCom