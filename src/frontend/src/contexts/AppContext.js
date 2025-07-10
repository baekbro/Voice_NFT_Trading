import React, {
  createContext,
  useContext,
  useState,
  useOptimistic,
  useTransition,
  useEffect,
} from "react";
import { isAuthenticated, getCurrentUser } from "../utils/auth";
import apiService from "../services/api";

// React 19: Context를 직접 Provider로 사용 가능
const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // 기본 상태
  const [user, setUser] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [mintedNFTs, setMintedNFTs] = useState([]);
  const [purchasedNFTs, setPurchasedNFTs] = useState([]);

  // React 19: useOptimistic으로 낙관적 업데이트
  const [optimisticNfts, addOptimisticNft] = useOptimistic(
    nfts,
    (currentNfts, newNft) => [...currentNfts, { ...newNft, isPending: true }]
  );

  // React 19: useTransition으로 비동기 작업 관리
  const [isPending, startTransition] = useTransition();

  // 초기화 시 인증 상태 확인
  useEffect(() => {
    const initializeAuth = async () => {
      if (isAuthenticated()) {
        try {
          // 서버에서 최신 사용자 정보 가져오기
          const userProfile = await apiService.auth.getProfile();
          console.log("AppContext - 사용자 프로필 로드:", userProfile);
          
          // 응답 구조에 따라 사용자 정보 및 NFT 목록 설정
          if (userProfile && userProfile.user) {
            setUser(userProfile.user);
            setMintedNFTs(userProfile.mintedNFTs || []);
            setPurchasedNFTs(userProfile.purchasedNFTs || []);
          } else if (userProfile && userProfile.success && userProfile.user) {
            setUser(userProfile.user);
            setMintedNFTs(userProfile.mintedNFTs || []);
            setPurchasedNFTs(userProfile.purchasedNFTs || []);
          } else {
            console.warn("사용자 정보 구조가 예상과 다름:", userProfile);
            setUser(userProfile); // fallback
            setMintedNFTs([]);
            setPurchasedNFTs([]);
          }
        } catch (error) {
          console.error("사용자 정보 로드 실패:", error);
          // 토큰이 유효하지 않은 경우 제거
          apiService.removeToken();
          setUser(null);
          setMintedNFTs([]);
          setPurchasedNFTs([]);
        }
      }
      setIsInitialized(true);
    };

    initializeAuth();
  }, []);

  // NFT 생성 액션 (React 19 Actions 패턴)
  const createNftAction = async (nftData) => {
    // 낙관적 업데이트로 즉시 UI 반영
    addOptimisticNft(nftData);

    startTransition(async () => {
      try {
        setIsLoading(true);
        // 실제 API 호출 시뮬레이션
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const newNft = {
          ...nftData,
          id: Date.now(),
          createdAt: new Date().toISOString(),
          isPending: false,
        };

        setNfts((prev) => [...prev, newNft]);
      } catch (error) {
        console.error("NFT 생성 실패:", error);
        // 에러 시 낙관적 업데이트 롤백 (자동으로 처리됨)
      } finally {
        setIsLoading(false);
      }
    });
  };

  // 지갑 연결 액션
  const connectWalletAction = async (walletType) => {
    startTransition(async () => {
      try {
        setIsLoading(true);
        // 지갑 연결 시뮬레이션
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setUser({
          id: "user_" + Date.now(),
          address: "0x" + Math.random().toString(16).substr(2, 40),
          walletType,
          connectedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error("지갑 연결 실패:", error);
      } finally {
        setIsLoading(false);
      }
    });
  };

  // 로그아웃 액션
  const logoutAction = () => {
    apiService.removeToken();
    setUser(null);
    setNfts([]);
  };

  const value = {
    // 상태
    user,
    nfts: optimisticNfts, // 낙관적 업데이트된 NFT 목록
    mintedNFTs,
    purchasedNFTs,
    isLoading: isLoading || isPending,
    isPending,
    isInitialized,
    isAuthenticated: !!user,

    // 액션들
    createNftAction,
    connectWalletAction,
    logoutAction,
    setUser,
    setNfts,
    setMintedNFTs,
    setPurchasedNFTs,
  };

  // React 19: Context를 직접 Provider로 사용
  return <AppContext value={value}>{children}</AppContext>;
};
