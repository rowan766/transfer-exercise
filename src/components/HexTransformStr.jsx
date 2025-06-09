import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function HexTransformStr(props) {
  const [formData, setFormData] = useState({
    hexStr: '',
    strStr: ''
  });
  const [formData2, setFormData2] = useState({
    hexStr: '',
    strStr: ''
  });
  const [error, setError] = useState('');
  const [error2, setError2] = useState('');
  // 十六进制转字符串
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTransfer = async () => {
    const { hexStr } = formData;
    if (!hexStr) {
      setError('请输入十六进制字符串');
    } else {
      try {
        const str = ethers.toUtf8String(hexStr);
        setFormData({ ...formData, strStr: str });
      } catch (e) {
        setError('输入的十六进制字符串格式不正确');
      }
    }
  };

  const handleClear = () => {
    setFormData({ ...formData, hexStr: '', strStr: '' });
    setError('');
  };

  // 字符串转十六进制
  const handleInputChange2 = (e) => {
    const { name, value } = e.target;
    setFormData2({ ...formData2, [name]: value });
  };

  const handleTransfer2 = async () => {
    const { strStr } = formData2;
    if (!strStr) {
      setError('请输入字符串');
    } else {
      try {
        const hex = ethers.hexlify(ethers.toUtf8Bytes(strStr)).toString();
        setFormData2({ ...formData2, hexStr: hex });
      } catch (e) {
        setError('输入的字符串有问题');
      }
    }
  };

  const handleClear2 = () => {
    setFormData2({ ...formData2, hexStr: '', strStr: '' });
    setError2('');
  };

  return (
    <>
      <div className="hex-str w-4/5 h-auto min-h-60px border border-gray-500 rounded-md p-4 magin-y-2 mt-2">
        <p className="text-gray-700 text-lg font-bold">{'十六进制转字符串'}</p>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <input type="text" name="hexStr" value={formData.hexStr} onChange={handleInputChange} placeholder="0x开头" />
        <buton className="px-4 py-2  font-normal bg-blue-600 text-white ml-1 mr-1" onClick={handleTransfer}>
          转换
        </buton>
        <input type="text" name="strStr" value={formData.strStr} onChange={handleInputChange} />

        <buton className="px-4 py-2  font-normal bg-red-600 text-white ml-1 mr-1" onClick={handleClear}>
          清除
        </buton>

        <p className="text-gray-700 text-lg font-bold mt-5">{'字符串转十六进制'}</p>

        {error2 && <p className="text-red-500 text-sm">{error}</p>}
        <input type="text" name="strStr" value={formData2.strStr} onChange={handleInputChange2} />
        <buton className="px-4 py-2  font-normal bg-blue-600 text-white ml-1 mr-1" onClick={handleTransfer2}>
          转换
        </buton>
        <input type="text" name="hexStr" value={formData2.hexStr} onChange={handleInputChange2} />

        <buton className="px-4 py-2  font-normal bg-red-600 text-white ml-1 mr-1" onClick={handleClear2}>
          清除
        </buton>
      </div>
    </>
  );
}

export default HexTransformStr;
1;
