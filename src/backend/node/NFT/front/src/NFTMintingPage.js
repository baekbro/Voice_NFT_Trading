import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import axios from 'axios';
import './NFTMintingPage.css';
import MyAudioNFT from './contracts/MyAudioNFT.json';
import NFTAudioFetcher from './components/NFTAudioFetcher';

const networkId = process.env.REACT_APP_NETWORK_ID || '1337';
const contractAddress = MyAudioNFT.networks?.[networkId]?.address;
const contractABI = MyAudioNFT.abi;

const PINATA_API_KEY = process.env.REACT_APP_PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.REACT_APP_PINATA_SECRET_API_KEY;

const NFTMintingPage = () => {
  const [account, setAccount] = useState('');
  const [nftName, setNftName] = useState('');
  const [nftDesc, setNftDesc] = useState('');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);

  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
    } else {
      alert('🦊 MetaMask가 필요합니다.');
    }
  }, []);

  const connectWallet = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(accounts[0]);

    const instance = new web3.eth.Contract(contractABI, contractAddress);
    setContract(instance);
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    if (selected.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(selected));
    } else {
      setPreviewUrl(null);
    }
  };

  const uploadToPinata = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('pinataMetadata', JSON.stringify({ name: file.name }));

    const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
      maxContentLength: 'Infinity',
      headers: {
        'Content-Type': 'multipart/form-data',
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY,
      },
    });

    return response.data.IpfsHash;
  };

  const uploadMetadataToPinata = async (name, description, audioCID) => {
    const metadata = {
      name,
      description,
      audio: `ipfs://${audioCID}`
    };

    const response = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', metadata, {
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY,
      },
    });

    return response.data.IpfsHash;
  };

  const handleMint = async () => {
    try {
      if (!file || !nftName || !nftDesc) {
        alert('⚠️ 모든 필드를 입력하세요.');
        return;
      }
  
      setStatus('🚀 스마트 컨트랙트 자동 배포 중...');
      await axios.post('http://localhost:8000/api/nft/mint'); // 백엔드가 Truffle 배포 + ABI 복사함
  
      setStatus('📦 Pinata에 오디오 파일 업로드 중...');
      const audioCID = await uploadToPinata(file);
  
      setStatus('📝 메타데이터 생성 및 업로드 중...');
      const metadataCID = await uploadMetadataToPinata(nftName, nftDesc, audioCID);
  
      const web3Instance = new Web3(window.ethereum);
      const netId = await web3Instance.eth.net.getId();
      const contractABI = MyAudioNFT.abi;
      const contractAddress = MyAudioNFT.networks[netId]?.address;
  
      const instance = new web3Instance.eth.Contract(contractABI, contractAddress);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  
      setStatus('⛏️ 민팅 중...');
      const result = await instance.methods.mintNFT(metadataCID, audioCID).send({ from: accounts[0] });
  
      setStatus(`✅ 민팅 완료! Token ID: ${result.events?.Transfer?.returnValues?.tokenId ?? '(응답 없음)'}`);
    } catch (err) {
      console.error(err);
      setStatus('❌ 민팅 실패');
    }
  };
  

  return (
    <div className="container">
      <h2>🎵 Audio NFT 민팅</h2>

      {!account ? (
        <button onClick={connectWallet}>🔌 지갑 연결</button>
      ) : (
        <p>🔗 연결됨: {account}</p>
      )}

      <div className="form">
        <input
          type="text"
          placeholder="NFT 이름"
          value={nftName}
          onChange={(e) => setNftName(e.target.value)}
        />
        <textarea
          placeholder="NFT 설명"
          value={nftDesc}
          onChange={(e) => setNftDesc(e.target.value)}
        />
        <input type="file" accept="audio/*,image/*" onChange={handleFileChange} />
        {previewUrl && <img src={previewUrl} alt="preview" style={{ width: 150 }} />}
        <button onClick={handleMint}>🛠️ NFT 민팅</button>
      </div>

      <p>{status}</p>
      <NFTAudioFetcher />
    </div>
  );
};

export default NFTMintingPage;
