import axios from 'axios';

const PINATA_API_KEY = process.env.REACT_APP_PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.REACT_APP_PINATA_SECRET_API_KEY;

export const uploadToPinata = async (file) => {
  if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
    throw new Error("Pinata API 키가 설정되지 않았습니다. 환경변수를 확인해주세요.");
  }
  
  if (!file) {
    throw new Error("업로드할 파일이 없습니다.");
  }
  
  const data = new FormData();
  data.append('file', file);
  
  try {
    const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", data, {
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY
      }
    });
    return res.data.IpfsHash;
  } catch (error) {
    console.error("Pinata 업로드 오류:", error);
    if (error.response?.status === 401) {
      throw new Error("Pinata API 키가 유효하지 않습니다.");
    } else if (error.response?.status === 413) {
      throw new Error("파일 크기가 너무 큽니다.");
    } else {
      throw new Error(`Pinata 업로드 실패: ${error.message}`);
    }
  }
};

export const uploadMetadataToPinata = async (metadata) => {
  if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
    throw new Error("Pinata API 키가 설정되지 않았습니다. 환경변수를 확인해주세요.");
  }
  
  if (!metadata) {
    throw new Error("업로드할 메타데이터가 없습니다.");
  }
  
  try {
    const res = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", metadata, {
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    return res.data.IpfsHash;
  } catch (error) {
    console.error("Pinata 메타데이터 업로드 오류:", error);
    if (error.response?.status === 401) {
      throw new Error("Pinata API 키가 유효하지 않습니다.");
    } else {
      throw new Error(`Pinata 메타데이터 업로드 실패: ${error.message}`);
    }
  }
};
