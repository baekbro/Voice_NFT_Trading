import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Web3 from 'web3';
import axios from 'axios';
import Button from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import Input from "../components/ui/Input";
import Textarea from "../components/ui/Textarea";
import Badge from "../components/ui/Badge";
import Progress from "../components/ui/Progress";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../hooks/useAuth";
import apiService from "../services/api";
import MyAudioNFT from "../contracts/MyAudioNFT.json";
import { uploadToPinata, uploadMetadataToPinata } from "../utils/pinata";
import {
  Upload,
  CheckCircle,
  Palette,
  DollarSign,
  Brain,
  AudioWaveform,
  Play,
  Pause,
  Volume2,
  Image,
  Wallet,
  Music,
  AlertCircle,
  Loader,
} from "lucide-react";

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    #f0fdfa 0%,
    #ffffff 35%,
    #f0f9ff 65%,
    #ecfdf5 100%
  );
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #1f2937;
  background: linear-gradient(135deg, #065f46, #0e7490);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Description = styled.p`
  color: #6b7280;
  font-size: 1rem;
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 3rem;
`;

const StepContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StepItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StepCircle = styled.div`
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) =>
    props.completed ? "#10b981" : props.active ? "#059669" : "#e5e7eb"};
  color: ${(props) => (props.active || props.completed ? "white" : "#9ca3af")};
  margin-bottom: 0.5rem;
`;

const StepTitle = styled.span`
  font-size: 0.875rem;
  margin-top: 0.5rem;
  color: ${(props) => (props.active ? "#059669" : "#6b7280")};
  font-weight: ${(props) => (props.active ? "500" : "normal")};
`;

const StepConnector = styled.div`
  width: 4rem;
  height: 1px;
  background: ${(props) => (props.completed ? "#10b981" : "#d1d5db")};
  margin: 0 1rem;
`;

const StyledCard = styled(Card)`
  border: none;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
`;

const CardHeader = styled.div`
  padding: 1.5rem 1.5rem 0;
`;

const CardTitle = styled.h3`
  display: flex;
  align-items: center;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;

  svg {
    margin-right: 0.5rem;
  }
`;

const CardDescription = styled.p`
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0.5rem 0;
`;

const UploadArea = styled.div`
  border: 2px dashed #86efac;
  border-radius: 12px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  background: rgba(240, 253, 250, 0.5);
  transition: all 0.2s ease;

  &:hover {
    border-color: #4ade80;
    background: rgba(240, 253, 250, 0.8);
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  }
`;

const ProcessingContainer = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background: rgba(240, 253, 250, 0.5);
  border-radius: 12px;
  border: 1px solid #bbf7d0;
`;

const ProcessingItem = styled.div`
  margin-bottom: 1.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const ProcessingHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const ProcessingTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
`;

const ProcessingProgress = styled.span`
  font-size: 0.875rem;
  color: #6b7280;
`;

const ProcessingDescription = styled.p`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.5rem;
`;

const PreviewCard = styled(StyledCard)`
  border: 2px solid #c084fc;
  background: linear-gradient(
    135deg,
    rgba(196, 132, 252, 0.05),
    rgba(236, 72, 153, 0.05)
  );
`;

const SampleGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const SampleButton = styled.button`
  padding: 0.75rem;
  text-align: left;
  font-size: 0.875rem;
  border-radius: 8px;
  border: 1px solid ${(props) => (props.selected ? "#c084fc" : "#e5e7eb")};
  background: ${(props) => (props.selected ? "#f3e8ff" : "white")};
  color: ${(props) => (props.selected ? "#7c3aed" : "#374151")};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #c084fc;
    background: rgba(243, 232, 255, 0.5);
  }
`;

const PlayButton = styled(Button)`
  background: linear-gradient(135deg, #7c3aed, #ec4899);
  border: none;
  padding: 1rem 2rem;
  font-size: 1.125rem;

  &:hover {
    background: linear-gradient(135deg, #6d28d9, #db2777);
  }
`;

const AudioVisualization = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid #c084fc;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  margin-top: 1rem;
`;

const AudioBar = styled.div`
  width: 4px;
  background: linear-gradient(to top, #7c3aed, #ec4899);
  border-radius: 2px;
  height: ${(props) => props.height}px;
  animation: pulse 0.5s ease-in-out infinite;
  animation-delay: ${(props) => props.delay}s;

  @keyframes pulse {
    0%,
    100% {
      opacity: 0.4;
    }
    50% {
      opacity: 1;
    }
  }
`;

const InfoCard = styled.div`
  background: ${(props) => props.color};
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid ${(props) => props.borderColor};
`;

const InfoTitle = styled.h4`
  font-weight: 500;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
`;

const InfoText = styled.p`
  font-size: 0.875rem;
  margin-bottom: 0.75rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #374151;
`;

const HelpText = styled.p`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
`;

const SummaryGrid = styled.div`
  background: #f0fdf4;
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid #bbf7d0;
  margin-bottom: 1.5rem;
`;

const SummaryTitle = styled.h3`
  font-weight: 500;
  margin-bottom: 0.75rem;
  color: #065f46;
`;

const SummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SummaryLabel = styled.span`
  color: #6b7280;
`;

const SummaryValue = styled.span`
  font-weight: 500;
  color: #1f2937;
`;

const GasFeeCard = styled.div`
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
`;

const GasFeeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
`;

const GasFeeAmount = styled.span`
  font-size: 1.125rem;
  font-weight: 700;
  color: #059669;
`;

const MintButton = styled(Button)`
  background: linear-gradient(135deg, #10b981, #0891b2);
  border: none;
  height: 3rem;

  &:hover {
    background: linear-gradient(135deg, #059669, #0e7490);
  }
`;

const ImagePreview = styled.div`
  margin-top: 1rem;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #bbf7d0;
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

// NFT 민팅 관련 스타일 추가
const WalletSection = styled.div`
  margin-bottom: 2rem;
`;

const WalletStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 0.5rem;
  background: ${props => props.connected ? 'var(--emerald-50)' : 'var(--gray-50)'};
  border: 1px solid ${props => props.connected ? 'var(--emerald-200)' : 'var(--gray-200)'};
  color: ${props => props.connected ? 'var(--emerald-700)' : 'var(--gray-700)'};
  font-size: 0.875rem;
`;

const WalletAddress = styled.span`
  font-family: monospace;
  background: rgba(0, 0, 0, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
`;

const StatusMessage = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &.loading {
    background: var(--blue-50);
    color: var(--blue-700);
    border: 1px solid var(--blue-200);
  }

  &.success {
    background: var(--emerald-50);
    color: var(--emerald-700);
    border: 1px solid var(--emerald-200);
  }

  &.error {
    background: var(--rose-50);
    color: var(--rose-700);
    border: 1px solid var(--rose-200);
  }
`;

const MintingOptionsCard = styled(StyledCard)`
  border: 2px solid #fbbf24;
  background: linear-gradient(
    135deg,
    rgba(251, 191, 36, 0.05),
    rgba(245, 158, 11, 0.05)
  );
`;

function CreatePage() {
  const { showSuccess, showPromise, showError } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // 페이지 로드 시 인증 확인
  useEffect(() => {
    if (!isAuthenticated) {
      // 현재 경로를 저장하고 로그인 페이지로 이동
      localStorage.setItem("redirectAfterLogin", "/create");
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const [currentStep, setCurrentStep] = useState(1);
  const [audioFile, setAudioFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedSample, setSelectedSample] = useState(0);
  const [customText, setCustomText] = useState("");
  const [audioGenerationProgress, setAudioGenerationProgress] = useState(0);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: "",
    price: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // NFT 민팅 관련 상태 추가
  const [account, setAccount] = useState('');
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [mintingStatus, setMintingStatus] = useState('');
  const [isMinting, setIsMinting] = useState(false);
  const [generatedAudioFilename, setGeneratedAudioFilename] = useState('');
  const [generatedAudioBlob, setGeneratedAudioBlob] = useState(null);
  // mintingMode 상태 제거

  const sampleTexts = [
    "안녕하세요, 저는 새로 학습된 AI 음성입니다. 자연스러운 발음으로 말씀드리고 있어요.",
    "오늘 날씨가 정말 좋네요. 이런 날에는 산책을 하거나 공원에서 시간을 보내는 것이 좋겠어요.",
    "AI 기술의 발전으로 이제 개인의 목소리도 디지털로 복제할 수 있게 되었습니다.",
    "책을 읽어드릴 때는 이런 톤으로 차분하고 따뜻하게 전달해드릴 수 있습니다.",
  ];

  // Web3 초기화
  useEffect(() => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
    } else {
      showError('MetaMask가 설치되지 않았습니다.');
    }
  }, [showError]);

  // 지갑 연결 함수
  const connectWallet = async () => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);

      const networkId = process.env.REACT_APP_NETWORK_ID || '1337';
      const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS || 
                             MyAudioNFT.networks?.[networkId]?.address;
      
      if (!contractAddress) {
        throw new Error('컨트랙트 주소를 찾을 수 없습니다.');
      }

      const instance = new web3.eth.Contract(MyAudioNFT.abi, contractAddress);
      setContract(instance);
      
      showSuccess('지갑이 성공적으로 연결되었습니다.');
    } catch (error) {
      console.error('지갑 연결 오류:', error);
      showError('지갑 연결에 실패했습니다.');
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setAudioFile(file);
      // 파일 선택 시에는 토스트 메시지 제거 (processAudio에서 처리됨)
      processAudio(file); // 파일을 직접 전달
    }
  };

  const processAudio = async (file) => {
    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      // JWT 토큰에서 사용자 ID 가져오기
      const token = localStorage.getItem("authToken");
      let userId = "temp_user";

      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          userId = payload.id || payload.kakaoId || payload._id || "temp_user";
          console.log("JWT 토큰 정보:", payload);
        } catch (e) {
          console.error("JWT 토큰 파싱 오류:", e);
        }
      }

      console.log("사용자 ID:", userId, "사용자 정보:", user);

      // 실제 음성 파일 업로드 및 처리
      const uploadPromise = apiService.tts.uploadVoice(
        userId,
        file || audioFile
      );

      // 진행률 시뮬레이션
      const progressInterval = setInterval(() => {
        setProcessingProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      // Handle alreadyRegistered response
      const response = await uploadPromise;
      if (response?.alreadyRegistered) {
        showSuccess("이미 음성이 등록되어 있습니다. 다음 단계로 이동합니다.");
        setProcessingProgress(100);
        setIsProcessing(false);
        startTraining();
        return;
      }

      // showPromise에서 성공 메시지 제거 (startTraining에서 학습 완료 메시지 표시)
      await showPromise(Promise.resolve(response), {
        loading: "음성 파일을 업로드하고 처리하는 중입니다...",
        success: "음성 파일이 성공적으로 업로드되었습니다!",
        error: "음성 파일 업로드에 실패했습니다. 다시 시도해주세요.",
      });

      clearInterval(progressInterval);
      setProcessingProgress(100);
      setIsProcessing(false);
      startTraining();
    } catch (error) {
      console.error("Audio processing error:", error);
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const startTraining = () => {
    setIsTraining(true);
    setTrainingProgress(0);

    // 학습 시뮬레이션 (실제로는 Spark-TTS가 즉시 사용 가능)
    const interval = setInterval(() => {
      setTrainingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsTraining(false);
          setCurrentStep(2);
          // 학습 완료 토스트 메시지 제거 (processAudio에서 이미 성공 메시지 표시됨)
          return 100;
        }
        return prev + 5;
      });
    }, 500);
  };

  const handlePlaySample = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    setAudioGenerationProgress(0);

    try {
      const token = localStorage.getItem("authToken");
      let userId = "temp_user";

      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        userId = payload.id || payload.kakaoId || payload._id || "temp_user";
      }

      const text = customText || sampleTexts[selectedSample];

      // 음성 생성 진행률 시뮬레이션 (더 균형잡힌 진행)
      const progressInterval = setInterval(() => {
        setAudioGenerationProgress((prev) => {
          if (prev >= 85) {
            clearInterval(progressInterval);
            return 85;
          }
          // 진행률에 따라 증가량을 조절 (초반은 빠르게, 후반은 천천히)
          const increment = prev < 30 ? 8 : prev < 60 ? 5 : 3;
          return prev + increment;
        });
      }, 300);

      // Use apiService.tts.generateSpeechBlob instead of direct fetch
      const audioResult = await apiService.tts.generateSpeechBlob(userId, text);
      
      // 완료 시 100%로 설정
      clearInterval(progressInterval);
      setAudioGenerationProgress(100);
      
      // 파일명과 Blob을 상태에 저장 (NFT 민팅 시 사용)
      if (audioResult.filename) {
        setGeneratedAudioFilename(audioResult.filename);
      }
      setGeneratedAudioBlob(audioResult.blob);
      
      const audioUrl = URL.createObjectURL(audioResult.blob);
      const audio = new Audio(audioUrl);
      audio.play();

      audio.onended = () => {
        setIsPlaying(false);
        setAudioGenerationProgress(0);
      };
    } catch (error) {
      console.error("음성 생성 오류:", error);
      setIsPlaying(false);
      setAudioGenerationProgress(0);
    }
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleMintNFT = async () => {
    // 생성된 오디오 파일이 있으면 그것을 사용, 없으면 업로드된 파일 사용
    const audioToUse = generatedAudioBlob || audioFile;
    
    if (!audioToUse) {
      showError("오디오 파일이 필요합니다.");
      return;
    }
    if (!formData.title.trim()) {
      showError("NFT 제목을 입력해주세요.");
      return;
    }
    if (!account || !contract) {
      showError("지갑을 먼저 연결해주세요.");
      return;
    }

    setIsMinting(true);
    setMintingStatus('');

    try {
      setMintingStatus('🖼️ 이미지 업로드 중...');
      const imageCID = await uploadToPinata(formData.image);

      setMintingStatus('🎧 오디오 업로드 중...');
      
      // Blob 객체인 경우 File 객체로 변환
      let audioFileToUpload = audioToUse;
      if (audioToUse instanceof Blob && !(audioToUse instanceof File)) {
        const filename = generatedAudioFilename || `generated_audio_${Date.now()}.wav`;
        audioFileToUpload = new File([audioToUse], filename, { type: audioToUse.type || 'audio/wav' });
      }
      
      const audioCID = await uploadToPinata(audioFileToUpload);

      setMintingStatus('📝 메타데이터 생성 중...');
      const metadata = {
        name: formData.title,
        description: formData.description,
        audio: `ipfs://${audioCID}`,
        image: `ipfs://${imageCID}`,
        attributes: [
          { trait_type: "Type", value: "Voice NFT" },
          { trait_type: "Created", value: new Date().toISOString() }
        ]
      };
      const metadataCID = await uploadMetadataToPinata(metadata);

      setMintingStatus('🚀 NFT 민팅 중...');
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const result = await contract.methods.mintNFT(metadataCID, audioCID).send({
        from: accounts[0],
        gas: 3000000
      });

      const tokenId = result.events?.Transfer?.returnValues?.tokenId;

      setMintingStatus('💾 데이터베이스 저장 중...');
      await axios.post('http://localhost:8000/api/nft/save', {
        title: formData.title,
        description: formData.description,
        price: formData.price || "0.1",
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        walletAddress: account,
        imageCID: imageCID,
        audioCID: audioCID,
        audioFilename: generatedAudioFilename || audioFile?.name || 'unknown'
      });

      setMintingStatus('✅ 오디오 NFT 민팅 완료!');
      showSuccess(`NFT가 성공적으로 민팅되었습니다!`);

      setTimeout(() => {
        navigate("/marketplace");
      }, 2000);
    } catch (error) {
      console.error("NFT 민팅 오류:", error);
      setMintingStatus('❌ 민팅 실패');
      
      // 더 구체적인 에러 메시지 제공
      let errorMessage = "민팅에 실패했습니다.";
      
      if (error.response?.status === 500) {
        // 서버 내부 오류 (주로 데이터베이스 문제)
        if (error.response.data?.details?.includes("MongoDB")) {
          errorMessage = "데이터베이스 연결에 문제가 있습니다. MongoDB가 실행 중인지 확인해주세요.";
        } else if (error.response.data?.details?.includes("필수 필드")) {
          errorMessage = "필수 정보가 누락되었습니다. 모든 필드를 입력해주세요.";
        } else {
          errorMessage = `서버 오류: ${error.response.data?.details || error.response.data?.error || '알 수 없는 오류'}`;
        }
      } else if (error.message.includes("pinata")) {
        errorMessage = "IPFS 업로드에 실패했습니다. Pinata API 키를 확인해주세요.";
      } else if (error.message.includes("gas")) {
        errorMessage = "가스비 부족으로 트랜잭션이 실패했습니다.";
      } else if (error.message.includes("network")) {
        errorMessage = "네트워크 연결에 문제가 있습니다.";
      } else if (error.message.includes("contract")) {
        errorMessage = "스마트 컨트랙트 호출에 실패했습니다.";
      } else if (error.code === "ECONNREFUSED") {
        errorMessage = "서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.";
      } else {
        errorMessage = `민팅에 실패했습니다: ${error.message}`;
      }
      
      showError(errorMessage);
    } finally {
      setIsMinting(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });

      // 이미지 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // 이미지 업로드 성공 메시지 (한 번만 표시)
      showSuccess(`${file.name} 이미지가 업로드되었습니다.`);
    }
  };

  const steps = [
    { number: 1, title: "음성 업로드", icon: Upload },
    { number: 2, title: "AI 음성 학습", icon: Brain },
    { number: 3, title: "메타데이터 추가", icon: Palette },
    { number: 4, title: "NFT 민팅", icon: DollarSign },
  ];

  return (
    <PageContainer>
      <Container>
        <Header>
          <Title>AI 음성 NFT 생성</Title>
          <Description>
            당신의 음성을 AI가 학습하여 독특한 TTS 음성 NFT로 변환하세요
          </Description>
        </Header>

        <StepIndicator>
          <StepContainer>
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              const isActive = currentStep >= step.number;
              const isCompleted = currentStep > step.number;

              return (
                <React.Fragment key={step.number}>
                  <StepItem>
                    <StepCircle active={isActive} completed={isCompleted}>
                      {isCompleted ? (
                        <CheckCircle size={24} />
                      ) : (
                        <IconComponent size={24} />
                      )}
                    </StepCircle>
                    <StepTitle active={isActive}>{step.title}</StepTitle>
                  </StepItem>
                  {index < steps.length - 1 && (
                    <StepConnector completed={currentStep > step.number} />
                  )}
                </React.Fragment>
              );
            })}
          </StepContainer>
        </StepIndicator>

        <div style={{ maxWidth: "1024px", margin: "0 auto" }}>
          {currentStep === 1 && (
            <StyledCard>
              <CardHeader>
                <CardTitle>
                  <Upload size={20} />
                  음성 샘플 업로드
                </CardTitle>
                <CardDescription>
                  AI 학습을 위한 음성 샘플을 업로드하세요 (최소 30초 권장)
                </CardDescription>
              </CardHeader>
              <CardContent style={{ padding: "0 1.5rem 1.5rem" }}>
                <UploadArea onClick={() => fileInputRef.current?.click()}>
                  <Upload
                    size={48}
                    style={{ margin: "0 auto 1rem", color: "#4ade80" }}
                  />
                  <p
                    style={{
                      fontSize: "1rem",
                      color: "#374151",
                      fontWeight: 500,
                      marginBottom: "0.5rem",
                    }}
                  >
                    {audioFile ? audioFile.name : "음성 파일을 선택하세요"}
                  </p>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#6b7280",
                      marginBottom: "0.5rem",
                    }}
                  >
                    클릭하여 업로드하거나 파일을 드래그 앤 드롭하세요
                  </p>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "#9ca3af",
                    }}
                  >
                    MP3, WAV, M4A 파일 지원 (최대 50MB, 30초 이상 권장)
                  </p>
                </UploadArea>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />

                {(isProcessing || isTraining) && (
                  <ProcessingContainer>
                    <ProcessingItem>
                      <ProcessingHeader>
                        <ProcessingTitle>
                          <AudioWaveform size={20} color="#059669" />
                          <span>오디오 전처리 중...</span>
                        </ProcessingTitle>
                        <ProcessingProgress>
                          {processingProgress}%
                        </ProcessingProgress>
                      </ProcessingHeader>
                      <Progress value={processingProgress} />
                      <ProcessingDescription>
                        노이즈 제거, 음성 분할, 품질 향상 중
                      </ProcessingDescription>
                    </ProcessingItem>

                    {isTraining && (
                      <ProcessingItem>
                        <ProcessingHeader>
                          <ProcessingTitle>
                            <Brain size={20} color="#7c3aed" />
                            <span>AI 음성 모델 학습 중...</span>
                          </ProcessingTitle>
                          <ProcessingProgress>
                            {trainingProgress}%
                          </ProcessingProgress>
                        </ProcessingHeader>
                        <Progress value={trainingProgress} />
                        <ProcessingDescription>
                          딥러닝 모델이 당신의 음성 특성을 학습하고 있습니다
                        </ProcessingDescription>
                      </ProcessingItem>
                    )}
                  </ProcessingContainer>
                )}
              </CardContent>
            </StyledCard>
          )}

          {currentStep === 2 && (
            <StyledCard>
              <CardHeader>
                <CardTitle>
                  <Volume2 size={24} />
                  AI 음성 학습 완료 - 음성 미리보기
                </CardTitle>
                <CardDescription>
                  AI가 당신의 음성을 성공적으로 학습했습니다. 아래에서 다양한
                  텍스트로 결과를 확인해보세요
                </CardDescription>
              </CardHeader>
              <CardContent style={{ padding: "0 1.5rem 1.5rem" }}>
                <PreviewCard style={{ marginBottom: "2rem" }}>
                  <CardHeader>
                    <CardTitle
                      style={{ fontSize: "1.25rem", color: "#7c3aed" }}
                    >
                      <CheckCircle size={24} color="#059669" />
                      학습된 AI 음성으로 미리듣기
                    </CardTitle>
                    <CardDescription>
                      다양한 샘플 텍스트나 직접 입력한 텍스트로 AI 음성을
                      테스트해보세요
                    </CardDescription>
                  </CardHeader>
                  <CardContent style={{ padding: "0 1.5rem 1.5rem" }}>
                    <div style={{ marginBottom: "1.5rem" }}>
                      <h4
                        style={{
                          fontWeight: 500,
                          marginBottom: "0.75rem",
                          color: "#1f2937",
                        }}
                      >
                        샘플 텍스트 선택
                      </h4>
                      <SampleGrid>
                        {sampleTexts.map((text, index) => (
                          <SampleButton
                            key={index}
                            selected={selectedSample === index}
                            onClick={() => setSelectedSample(index)}
                          >
                            {text}
                          </SampleButton>
                        ))}
                      </SampleGrid>
                    </div>

                    <div style={{ marginBottom: "1.5rem" }}>
                      <h4
                        style={{
                          fontWeight: 500,
                          marginBottom: "0.5rem",
                          color: "#1f2937",
                        }}
                      >
                        또는 직접 입력
                      </h4>
                      <Textarea
                        placeholder="원하는 텍스트를 입력하여 AI 음성으로 들어보세요..."
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                        rows={3}
                        style={{ borderColor: "#c084fc" }}
                      />
                    </div>

                    <div
                      style={{ textAlign: "center", marginBottom: "1.5rem" }}
                    >
                      <PlayButton
                        onClick={handlePlaySample}
                        disabled={isPlaying}
                      >
                        {isPlaying ? (
                          <>
                            <Pause
                              size={24}
                              style={{ marginRight: "0.5rem" }}
                            />
                            음성 생성 중... {audioGenerationProgress}%
                          </>
                        ) : (
                          <>
                            <Play size={24} style={{ marginRight: "0.5rem" }} />
                            음성 미리듣기
                          </>
                        )}
                      </PlayButton>
                      <p
                        style={{
                          fontSize: "0.875rem",
                          color: "#6b7280",
                          marginTop: "0.5rem",
                        }}
                      >
                        {isPlaying && audioGenerationProgress >= 85
                          ? "거의 다 완성되었습니다! 조금만 더 기다려주세요."
                          : customText
                          ? "입력한 텍스트로 음성을 생성합니다"
                          : `샘플 ${selectedSample + 1}로 음성을 생성합니다`}
                      </p>
                    </div>

                    {isPlaying && (
                      <ProcessingContainer style={{ marginTop: "1rem" }}>
                        <ProcessingItem>
                          <ProcessingHeader>
                            <ProcessingTitle>
                              <AudioWaveform size={20} color="#7c3aed" />
                              <span>AI 음성 생성 중...</span>
                            </ProcessingTitle>
                            <ProcessingProgress>
                              {audioGenerationProgress}%
                            </ProcessingProgress>
                          </ProcessingHeader>
                          <Progress value={audioGenerationProgress} />
                          <ProcessingDescription>
                            {audioGenerationProgress < 30 
                              ? "텍스트 분석 및 음성 특성 적용 중"
                              : audioGenerationProgress < 70
                              ? "AI 모델이 음성을 생성하고 있습니다"
                              : audioGenerationProgress < 100
                              ? "음성 품질 최적화 중"
                              : "음성 생성 완료! 재생을 시작합니다"}
                          </ProcessingDescription>
                        </ProcessingItem>
                      </ProcessingContainer>
                    )}
                  </CardContent>
                </PreviewCard>

                <InfoCard color="#eff6ff" borderColor="#bfdbfe">
                  <InfoTitle style={{ color: "#1e40af" }}>
                    🎉 학습 완료!
                  </InfoTitle>
                  <InfoText style={{ color: "#1e40af" }}>
                    AI가 당신의 음성 특성을 성공적으로 학습했습니다. 위에서
                    다양한 텍스트로 음성을 테스트해보세요.
                  </InfoText>
                  <InfoText style={{ color: "#1d4ed8" }}>
                    만족스러우시면 이 음성 모델을 NFT로 민팅하여 다른 사용자들이
                    구매하고 TTS 기능으로 사용할 수 있게 하세요.
                  </InfoText>
                </InfoCard>

                <Button
                  onClick={handleNextStep}
                  style={{
                    width: "100%",
                    background: "linear-gradient(135deg, #059669, #0e7490)",
                    border: "none",
                    height: "3rem",
                    fontSize: "1.125rem",
                    marginTop: "1.5rem",
                  }}
                >
                  음성이 만족스럽습니다. 메타데이터로 계속
                </Button>
              </CardContent>
            </StyledCard>
          )}

          {currentStep === 3 && (
            <StyledCard>
              <CardHeader>
                <CardTitle>
                  <Palette size={20} />
                  메타데이터 추가
                </CardTitle>
                <CardDescription>
                  AI 음성 NFT에 대한 세부 정보를 제공하세요
                </CardDescription>
              </CardHeader>
              <CardContent style={{ padding: "0 1.5rem 1.5rem" }}>
                <FormGroup>
                  <Label>제목</Label>
                  <Input
                    placeholder="예: 김민수의 따뜻한 목소리"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    style={{ borderColor: "#bbf7d0" }}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>설명</Label>
                  <Textarea
                    placeholder="이 AI 음성의 특징과 용도를 설명해주세요..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                    style={{ borderColor: "#bbf7d0" }}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>태그</Label>
                  <Input
                    placeholder="쉼표로 구분된 태그 입력"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    style={{ borderColor: "#bbf7d0" }}
                  />
                  <HelpText>예: 남성, 따뜻함, 내레이션, 한국어</HelpText>
                </FormGroup>

                <FormGroup>
                  <Label>판매 가격 (ETH) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    style={{ borderColor: "#bbf7d0" }}
                  />
                  <HelpText>NFT 판매 가격을 ETH 단위로 입력하세요</HelpText>
                </FormGroup>

                <FormGroup>
                  <Label>마켓플레이스 이미지</Label>
                  <UploadArea onClick={() => imageInputRef.current?.click()}>
                    <Image
                      size={32}
                      style={{ margin: "0 auto 0.5rem", color: "#4ade80" }}
                    />
                    <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                      {formData.image
                        ? formData.image.name
                        : "클릭하여 이미지 업로드"}
                    </p>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "#9ca3af",
                        marginTop: "0.25rem",
                      }}
                    >
                      JPG, PNG, GIF (최대 10MB, 권장: 500x500px)
                    </p>
                  </UploadArea>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                  />
                  {imagePreview && (
                    <ImagePreview>
                      <PreviewImage src={imagePreview} alt="NFT 미리보기" />
                    </ImagePreview>
                  )}
                  <HelpText>
                    마켓플레이스에 표시될 NFT 대표 이미지를 업로드하세요
                  </HelpText>
                </FormGroup>

                <InfoCard color="#fffbeb" borderColor="#fde68a">
                  <InfoTitle style={{ color: "#d97706" }}>
                    💡 TTS 사용 권한
                  </InfoTitle>
                  <InfoText style={{ color: "#d97706" }}>
                    이 NFT를 구매한 사용자는 학습된 AI 음성으로 텍스트를
                    음성으로 변환할 수 있습니다.
                  </InfoText>
                </InfoCard>

                <Button
                  onClick={handleNextStep}
                  disabled={
                    !formData.title ||
                    !formData.description ||
                    !formData.price ||
                    parseFloat(formData.price) <= 0
                  }
                  style={{
                    width: "100%",
                    background:
                      formData.title &&
                      formData.description &&
                      formData.price &&
                      parseFloat(formData.price) > 0
                        ? "linear-gradient(135deg, #059669, #0e7490)"
                        : "#9ca3af",
                    border: "none",
                    marginTop: "1.5rem",
                  }}
                >
                  민팅으로 계속
                </Button>
              </CardContent>
            </StyledCard>
          )}

          {currentStep === 4 && (
            <>
              {/* 지갑 연결 섹션 */}
              <WalletSection>
                {!account ? (
                  <Button onClick={connectWallet} size="lg" fullWidth>
                    <Wallet size={20} />
                    지갑 연결하기
                  </Button>
                ) : (
                  <WalletStatus connected>
                    <CheckCircle size={16} />
                    <span>지갑이 연결되었습니다:</span>
                    <WalletAddress>{account}</WalletAddress>
                  </WalletStatus>
                )}
              </WalletSection>

              {/* 민팅 모드 선택 */}
              {/* 민팅 방식 선택 UI 제거 */}

              {/* NFT 요약 및 민팅 */}
              <StyledCard>
                <CardHeader>
                  <CardTitle>
                    <DollarSign size={20} />
                    오디오 NFT 민팅하기
                  </CardTitle>
                  <CardDescription>
                    학습된 AI 음성 모델을 NFT로 민팅하고 마켓플레이스에 등록하세요
                  </CardDescription>
                </CardHeader>
                <CardContent style={{ padding: "0 1.5rem 1.5rem" }}>
                  <SummaryGrid>
                    <SummaryTitle>오디오 NFT 요약</SummaryTitle>
                    <SummaryItem>
                      <SummaryLabel>제목:</SummaryLabel>
                      <SummaryValue>{formData.title || "제목 없음"}</SummaryValue>
                    </SummaryItem>
                    <SummaryItem>
                      <SummaryLabel>판매 가격:</SummaryLabel>
                      <SummaryValue>
                        {formData.price ? `${formData.price} ETH` : "가격 없음"}
                      </SummaryValue>
                    </SummaryItem>
                    <SummaryItem>
                      <SummaryLabel>이미지:</SummaryLabel>
                      <SummaryValue>
                        {formData.image ? "업로드됨" : "없음"}
                      </SummaryValue>
                    </SummaryItem>
                    <SummaryItem>
                      <SummaryLabel>오디오:</SummaryLabel>
                      <SummaryValue>
                        {audioFile ? "업로드됨" : "없음"}
                      </SummaryValue>
                    </SummaryItem>
                    {/* mintingMode 관련 분기 모두 제거 */}
                    <SummaryItem>
                      <SummaryLabel>민팅 방식:</SummaryLabel>
                      <Badge
                        variant="outline"
                        style={{ borderColor: "#fbbf24", color: "#d97706" }}
                      >
                        오디오 NFT
                      </Badge>
                    </SummaryItem>
                  </SummaryGrid>

                  <GasFeeCard>
                    <GasFeeHeader>
                      <span style={{ fontWeight: 500 }}>예상 가스비</span>
                      <GasFeeAmount>0.025 ETH</GasFeeAmount>
                    </GasFeeHeader>
                    <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                      이더리움에서 민팅하기 위한 네트워크 수수료
                    </p>
                  </GasFeeCard>

                  <MintButton 
                    onClick={handleMintNFT}
                    disabled={!account || !contract || isMinting}
                  >
                    {isMinting ? (
                      <>
                        <Loader size={20} style={{ animation: 'spin 1s linear infinite', marginRight: "0.5rem" }} />
                        민팅 중...
                      </>
                    ) : (
                      <>
                        <DollarSign size={20} style={{ marginRight: "0.5rem" }} />
                        오디오 NFT 민팅하기
                      </>
                    )}
                  </MintButton>

                  {mintingStatus && (
                    <StatusMessage className={
                      mintingStatus.includes('✅') ? 'success' : 
                      mintingStatus.includes('❌') ? 'error' : 'loading'
                    }>
                      {mintingStatus.includes('✅') && <CheckCircle size={16} />}
                      {mintingStatus.includes('❌') && <AlertCircle size={16} />}
                      {!mintingStatus.includes('✅') && !mintingStatus.includes('❌') && <Loader size={16} />}
                      {mintingStatus}
                    </StatusMessage>
                  )}

                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "#9ca3af",
                      textAlign: "center",
                      marginTop: "1rem",
                    }}
                  >
                    민팅함으로써 이용약관에 동의하고 오디오 NFT의 소유권을
                    확인합니다
                  </p>
                </CardContent>
              </StyledCard>
            </>
          )}
        </div>
      </Container>
    </PageContainer>
  );
}

export default CreatePage;
