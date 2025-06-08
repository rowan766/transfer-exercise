import { useState, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { ethers } from 'ethers'

function TransferCom() {
    const [formData, setFormData] = useState({
        toAddress: '',
        amount: '',
        tokenType: 'ETH'
    })

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleTransfer=(e)=>{

    }
return (
     <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg border">
         <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">转账</h3>
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
                    <button className="px-4 py-2  font-normal bg-blue-600 text-white" onClick={handleTransfer}>转账</button>

         </div>
     </div>
)
}

export default TransferCom