import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Play, Heart, Share2, Loader, ArrowLeft } from "lucide-react";
import Button from "../../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { useToast } from "../../hooks/useToast";
import { useAuth } from "../../hooks/useAuth";
import apiService from "../../services/api";

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(
    to bottom right,
    var(--emerald-50),
    var(--white),
    var(--teal-50)
  );

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const NFTGrid = styled.div`
  display: grid;
  gap: 2rem;

  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }
`;

const NFTImage = styled.div`
  aspect-ratio: 1;
  background: linear-gradient(
    to bottom right,
    var(--emerald-100),
    var(--teal-100)
  );
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  .play-button {
    width: 5rem;
    height: 5rem;
    background: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--shadow-xl);
    cursor: pointer;
    transition: transform 0.15s ease-in-out;

    &:hover {
      transform: scale(1.1);
    }

    svg {
      width: 2rem;
      height: 2rem;
      color: var(--emerald-600);
    }
  }
`;

const NFTInfo = styled.div`
  .nft-header {
    margin-bottom: 2rem;

    h1 {
      font-size: 2rem;
      font-weight: bold;
      color: var(--gray-900);
      margin-bottom: 0.5rem;
    }

    .creator {
      color: var(--gray-600);
      font-size: 1.125rem;
    }
  }

  .nft-price {
    font-size: 2rem;
    font-weight: bold;
    color: var(--emerald-600);
    margin-bottom: 1.5rem;
  }

  .nft-actions {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
  }

  .nft-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-bottom: 2rem;

    .stat-item {
      .label {
        font-size: 0.875rem;
        color: var(--gray-600);
        margin-bottom: 0.25rem;
      }

      .value {
        font-weight: 600;
        color: var(--gray-900);
      }
    }
  }
`;

const DescriptionCard = styled(Card)`
  border: none;
  box-shadow: var(--shadow-lg);
`;

const NFTDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError, showPromise } = useToast();
  const { isAuthenticated, user } = useAuth();

  const [nft, setNft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  
  // 중복 실행 방지를 위한 ref
  const authCheckRef = useRef(false);
  const nftLoadRef = useRef(false);

  // 인증 상태 체크 및 리다이렉트
  useEffect(() => {
    if (authCheckRef.current) return; // 이미 실행됐으면 중단
    
    if (!isAuthenticated) {
      authCheckRef.current = true;
      showError("NFT 상세 정보를 보려면 로그인이 필요합니다.");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
      return;
    }
  }, [isAuthenticated, navigate, showError]);

  // NFT 상세 정보 로딩
  useEffect(() => {
    // 인증되지 않은 경우 또는 이미 로딩했으면 중단
    if (!isAuthenticated || nftLoadRef.current) {
      return;
    }

    const loadNFTDetails = async () => {
      try {
        nftLoadRef.current = true; // 로딩 시작 표시
        setLoading(true);
        console.log(`NFT 상세 정보 로딩 중... Token ID: ${id}`);

        const response = await apiService.nft.getById(id);
        console.log("NFT 상세 정보 응답:", response);
        console.log("price 타입:", typeof response.price);
        console.log("price 값:", response.price);
        console.log("parseFloat(price):", parseFloat(response.price));
        console.log("price > 0 체크:", response.price && parseFloat(response.price) > 0);

        // API 응답이 직접 NFT 데이터인 경우
        // 프론트엔드에서도 price 변환 처리
        if (response.price && typeof response.price === 'object') {
          if (response.price.$numberDecimal) {
            response.price = parseFloat(response.price.$numberDecimal);
          } else if (response.price.toString) {
            response.price = parseFloat(response.price.toString());
          }
        }
        
        console.log("최종 처리된 NFT 데이터:", response);
        setNft(response);
      } catch (error) {
        console.error("NFT 상세 정보 로딩 실패:", error);

        // 404 에러인 경우 특별한 메시지 표시
        if (
          error.message.includes("404") ||
          error.message.includes("존재하지 않습니다")
        ) {
          showError("해당 NFT를 찾을 수 없습니다.");
        } else {
          showError("NFT 정보를 불러오는데 실패했습니다.");
        }

        // 실패 시 마켓플레이스로 이동
        setTimeout(() => {
          navigate("/marketplace");
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadNFTDetails();
    }
  }, [id, isAuthenticated, showError, navigate]);

  // NFT 구매 처리
  const handlePurchase = async () => {
    if (!isAuthenticated) {
      showError("구매하려면 로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    if (!user?.walletAddress) {
      showError("지갑 주소가 설정되지 않았습니다. 프로필을 완성해주세요.");
      return;
    }

    try {
      // 1. 카카오페이 결제 준비 요청
      const readyData = {
        item_name: nft.title || "Voice NFT",
        quantity: 1,
        total_amount: nft.price,
        tokenId: nft._id,
        sellerWallet: nft.walletAddress,
      };
      const readyRes = await apiService.kakaopay.ready(readyData);
      // readyRes에 결제 페이지 URL이 포함되어 있다고 가정 (ex: next_redirect_pc_url)
      if (readyRes.next_redirect_pc_url) {
        // 2. 결제 페이지로 이동 (카카오페이 결제)
        window.location.href = readyRes.next_redirect_pc_url;
        // 결제 완료 후 카카오페이에서 지정한 redirect/callback URL로 이동됨
        // 그곳에서 approve API를 호출해야 함 (ex: /kakaopay/success?pg_token=...)
      } else {
        showError("카카오페이 결제 준비에 실패했습니다.");
      }
    } catch (error) {
      console.error("카카오페이 결제 준비 오류:", error);
      showError("카카오페이 결제 준비에 실패했습니다.");
    }
  };

  // 오디오 URL 생성 함수
  const getAudioUrl = () => {
    if (nft?.audioUrl) return nft.audioUrl;
    if (nft?.audioCID) return `https://gateway.pinata.cloud/ipfs/${nft.audioCID}`;
    return null;
  };

  // TTS 생성된 음성 URL 가져오기
  const getTTSAudioUrl = async () => {
    if (!nft?.walletAddress) return null;
    
    try {
      // 사용자의 생성된 음성 파일 목록 가져오기
      const response = await apiService.tts.getGeneratedVoices(nft.walletAddress);
      const voices = response.voices || [];
      
      // 가장 최근 생성된 음성 파일 반환
      if (voices.length > 0) {
        const latestVoice = voices[0]; // 이미 최신순으로 정렬되어 있음
        return latestVoice;
      }
      return null;
    } catch (error) {
      console.error("TTS 음성 목록 가져오기 실패:", error);
      return null;
    }
  };

  // 음성 재생/정지
  const handlePlayAudio = async () => {
    try {
      // 이미 재생 중이면 정지
      if (isPlaying) {
        setIsPlaying(false);
        return;
      }

      // 1. 먼저 IPFS에서 오디오 시도
      const audioUrl = getAudioUrl();
      if (audioUrl) {
        setIsPlaying(true);
        showSuccess("음성 재생을 시작합니다.");
        const audio = new Audio(audioUrl);
        audio.play();
        audio.onended = () => {
          setIsPlaying(false);
        };
        // 3초 후 강제 정지
        setTimeout(() => {
          setIsPlaying(false);
          audio.pause();
          audio.currentTime = 0;
        }, 3000);
        return;
      }

      // 2. IPFS 오디오가 없으면 TTS 생성된 음성 파일 시도
      setIsLoadingAudio(true);
      const ttsAudioUrl = await getTTSAudioUrl();
      setIsLoadingAudio(false);
      
      if (ttsAudioUrl) {
        setIsPlaying(true);
        showSuccess("TTS 음성 재생을 시작합니다.");
        const audio = new Audio(ttsAudioUrl);
        audio.play();
        audio.onended = () => {
          setIsPlaying(false);
        };
        // 3초 후 강제 정지
        setTimeout(() => {
          setIsPlaying(false);
          audio.pause();
          audio.currentTime = 0;
        }, 3000);
      } else {
        showError("재생할 수 있는 음성 파일이 없습니다.");
      }
    } catch (error) {
      console.error("음성 재생 오류:", error);
      setIsPlaying(false);
      setIsLoadingAudio(false);
      showError("음성 재생에 실패했습니다.");
    }
  };

  // 좋아요 토글
  const handleLikeToggle = () => {
    setIsLiked(!isLiked);
    showSuccess(isLiked ? "좋아요를 취소했습니다." : "좋아요를 추가했습니다.");
  };

  // 공유 기능
  const handleShare = () => {
    if (navigator.share && nft) {
      navigator.share({
        title: nft.title,
        text: nft.description,
        url: window.location.href,
      });
    } else {
      // 클립보드에 URL 복사
      navigator.clipboard.writeText(window.location.href);
      showSuccess("링크가 클립보드에 복사되었습니다.");
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <Container>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "50vh",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <Loader
              size={48}
              className="animate-spin"
              style={{ color: "var(--emerald-500)" }}
            />
            <p style={{ color: "var(--gray-600)", fontSize: "1.125rem" }}>
              NFT 정보를 불러오는 중...
            </p>
          </div>
        </Container>
      </PageContainer>
    );
  }

  if (!nft) {
    return (
      <PageContainer>
        <Container>
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              color: "var(--gray-600)",
            }}
          >
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
              NFT를 찾을 수 없습니다
            </h2>
            <p style={{ marginBottom: "2rem" }}>
              요청하신 NFT가 존재하지 않거나 삭제되었습니다.
            </p>
            <Button onClick={() => navigate("/marketplace")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              마켓플레이스로 돌아가기
            </Button>
          </div>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Container>
        <div style={{ marginBottom: "2rem" }}>
          <Button
            variant="ghost"
            onClick={() => navigate("/marketplace")}
            style={{ marginBottom: "1rem" }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            마켓플레이스로 돌아가기
          </Button>
        </div>

        <NFTGrid>
          <div>
            <NFTImage>
              {(nft.imageUrl || nft.imageCID) && (
                <img
                  src={
                    nft.imageUrl
                      ? nft.imageUrl
                      : `https://gateway.pinata.cloud/ipfs/${nft.imageCID}`
                  }
                  alt={nft.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    position: "absolute",
                    inset: 0,
                  }}
                />
              )}
              <div
                className="play-button"
                onClick={handlePlayAudio}
                style={{
                  position: "relative",
                  zIndex: 1,
                  backgroundColor: isPlaying ? "var(--emerald-600)" : 
                                   isLoadingAudio ? "var(--amber-500)" : "white",
                }}
              >
                {isLoadingAudio ? (
                  <Loader
                    size={24}
                    style={{
                      color: "white",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                ) : (
                  <Play
                    style={{
                      color: isPlaying ? "white" : "var(--emerald-600)",
                      transform: isPlaying ? "scale(1.2)" : "scale(1)",
                    }}
                  />
                )}
              </div>
            </NFTImage>
          </div>

          <NFTInfo>
            <div className="nft-header">
              <h1>{nft.title}</h1>
              <p className="creator">
                {nft.creator || `@${nft.walletAddress?.slice(0, 8)}...`}
              </p>
            </div>

            <div className="nft-price">
              {nft.price && parseFloat(nft.price) > 0 ? `${nft.price} ETH` : "Free"}
            </div>

            <div className="nft-actions">
              {nft.price && parseFloat(nft.price) > 0 ? (
                <Button size="lg" onClick={handlePurchase}>
                  {nft.price} ETH로 구매하기
                </Button>
              ) : (
                <Button size="lg" disabled>
                  무료 NFT
                </Button>
              )}
              <Button
                variant="outline"
                size="lg"
                onClick={handleLikeToggle}
                style={{
                  backgroundColor: isLiked
                    ? "var(--emerald-50)"
                    : "transparent",
                  borderColor: isLiked
                    ? "var(--emerald-500)"
                    : "var(--gray-300)",
                  color: isLiked ? "var(--emerald-600)" : "var(--gray-700)",
                }}
              >
                <Heart
                  className="w-4 h-4 mr-2"
                  fill={isLiked ? "currentColor" : "none"}
                />
                좋아요
              </Button>
              <Button variant="ghost" size="lg" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                공유
              </Button>
            </div>

            <div className="nft-stats">
              {/* 토큰 ID 항목 제거 */}
              <div className="stat-item">
                <div className="label">체인</div>
                <div className="value">{nft.blockchain || "Ethereum"}</div>
              </div>
              <div className="stat-item">
                <div className="label">생성일</div>
                <div className="value">
                  {nft.createdAt
                    ? new Date(nft.createdAt).toLocaleDateString("ko-KR")
                    : "정보 없음"}
                </div>
              </div>
              <div className="stat-item">
                <div className="label">소유자</div>
                <div className="value">
                  {nft.walletAddress
                    ? `${nft.walletAddress.slice(0, 8)}...`
                    : "정보 없음"}
                </div>
              </div>
            </div>

            <DescriptionCard>
              <CardHeader>
                <CardTitle>설명</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{nft.description || "설명이 없습니다."}</p>
                {nft.tags && nft.tags.length > 0 && (
                  <div style={{ marginTop: "1rem" }}>
                    <h4
                      style={{
                        fontSize: "0.875rem",
                        color: "var(--gray-600)",
                        marginBottom: "0.5rem",
                      }}
                    >
                      태그
                    </h4>
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        flexWrap: "wrap",
                      }}
                    >
                      {nft.tags.map((tag, index) => (
                        <span
                          key={index}
                          style={{
                            padding: "0.25rem 0.5rem",
                            backgroundColor: "var(--emerald-100)",
                            color: "var(--emerald-700)",
                            borderRadius: "0.25rem",
                            fontSize: "0.75rem",
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </DescriptionCard>
          </NFTInfo>
        </NFTGrid>
      </Container>
    </PageContainer>
  );
};

export default NFTDetailsPage;
