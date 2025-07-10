import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import {
  Settings,
  Plus,
  TrendingUp,
  Heart,
  Eye,
  Copy,
  ExternalLink,
  Edit3,
  Check,
  X,
  Play,
  Loader
} from "lucide-react";
import Button from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { useAppContext } from "../../contexts/AppContext";
import { useToast } from "../../hooks/useToast";
import ApiService from "../../services/api";

// 소셜 로그인 아이콘 컴포넌트들
const KakaoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z" />
  </svg>
);

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const NaverIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.273 12.845 7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z" />
  </svg>
);

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(
    to bottom right,
    var(--emerald-50),
    var(--white),
    var(--teal-50)
  );
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const ProfileHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 3rem;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: flex-start;
  }

  .avatar {
    width: 8rem;
    height: 8rem;
    border-radius: 50%;
    background: linear-gradient(
      to bottom right,
      var(--emerald-400),
      var(--teal-500)
    );
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: bold;
    color: white;
    margin: 0 auto;

    @media (min-width: 768px) {
      margin: 0;
    }
  }

  .profile-info {
    flex: 1;
    text-align: center;

    @media (min-width: 768px) {
      text-align: left;
    }

    h1 {
      font-size: 2rem;
      font-weight: bold;
      color: var(--gray-900);
      margin-bottom: 0.5rem;
    }

    .username {
      color: var(--gray-600);
      font-size: 1.125rem;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      justify-content: center;

      @media (min-width: 768px) {
        justify-content: flex-start;
      }
    }

    .bio {
      color: var(--gray-700);
      max-width: 32rem;
      margin-bottom: 1rem;
    }

    .social-platform {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      justify-content: center;
      margin-bottom: 1rem;
      font-size: 0.875rem;
      color: var(--gray-600);

      @media (min-width: 768px) {
        justify-content: flex-start;
      }

      .platform-icon {
        padding: 0.25rem;
        border-radius: 0.25rem;
        display: flex;
        align-items: center;
        justify-content: center;

        &.kakao {
          background: #fee500;
          color: #000000;
        }

        &.google {
          background: #ffffff;
          color: #000000;
          border: 1px solid #dadce0;
        }

        &.naver {
          background: #03c75a;
          color: white;
        }

        svg {
          width: 1rem;
          height: 1rem;
        }
      }
    }
  }

  .profile-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;

    @media (min-width: 768px) {
      justify-content: flex-start;
    }
  }
`;

const BlockchainInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;

  @media (min-width: 768px) {
    flex-direction: row;
    gap: 2rem;
  }
`;

const InfoCard = styled(Card)`
  flex: 1;
  border: none;
  box-shadow: var(--shadow-lg);

  .info-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;

    .label {
      font-size: 0.875rem;
      color: var(--gray-600);
    }

    .copy-btn {
      background: none;
      border: none;
      color: var(--gray-400);
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 0.25rem;
      transition: all 0.15s ease;

      &:hover {
        color: var(--emerald-600);
        background: var(--emerald-50);
      }

      svg {
        width: 1rem;
        height: 1rem;
      }
    }
  }

  .info-value {
    font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
    font-size: 0.875rem;
    color: var(--gray-900);
    word-break: break-all;
    margin-bottom: 0.5rem;
  }

  .info-amount {
    font-size: 1.25rem;
    font-weight: bold;
    color: var(--emerald-600);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const StatCard = styled(Card)`
  text-align: center;
  border: none;
  box-shadow: var(--shadow-lg);

  .stat-icon {
    width: 3rem;
    height: 3rem;
    background: linear-gradient(
      to bottom right,
      var(--emerald-100),
      var(--teal-100)
    );
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;

    svg {
      width: 1.5rem;
      height: 1.5rem;
      color: var(--emerald-600);
    }
  }

  .stat-number {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--gray-900);
    margin-bottom: 0.25rem;
  }

  .stat-label {
    font-size: 0.875rem;
    color: var(--gray-600);
  }
`;

const TabsSection = styled.div`
  .tabs-list {
    display: flex;
    background: var(--emerald-50);
    border: 1px solid var(--emerald-200);
    border-radius: 0.375rem;
    padding: 0.25rem;
    margin-bottom: 2rem;
  }

  .tab-trigger {
    flex: 1;
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    border: none;
    border-radius: 0.25rem;
    background-color: ${(props) =>
      props.$active ? "var(--emerald-500)" : "transparent"};
    color: ${(props) => (props.$active ? "white" : "var(--gray-700)")};
    cursor: pointer;
    transition: all 0.15s ease-in-out;

    &:hover {
      background-color: ${(props) =>
        props.$active ? "var(--emerald-600)" : "var(--emerald-100)"};
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;

  .empty-icon {
    width: 4rem;
    height: 4rem;
    background: var(--gray-100);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;

    svg {
      width: 2rem;
      height: 2rem;
      color: var(--gray-400);
    }
  }

  h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--gray-900);
    margin-bottom: 0.5rem;
  }

  p {
    color: var(--gray-600);
    margin-bottom: 1.5rem;
  }
`;

const NFTGrid = styled.div`
  display: grid;
  gap: 1.5rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

const NFTCard = styled(Card)`
  transition: all 0.3s ease-in-out;
  border: none;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  background: white;

  &:hover {
    box-shadow: var(--shadow-xl);
    transform: scale(1.05);
  }
`;

const NFTImageContainer = styled.div`
  position: relative;
  aspect-ratio: 1;
  background: linear-gradient(
    to bottom right,
    var(--emerald-100),
    var(--teal-100)
  );
  overflow: hidden;

  .bg-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to right,
      rgba(52, 211, 153, 0.2),
      rgba(45, 212, 191, 0.2)
    );
  }

  .play-button {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    .play-circle {
      width: 5rem;
      height: 5rem;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-lg);
      transition: transform 0.15s ease-in-out;

      svg {
        width: 2rem;
        height: 2rem;
        color: var(--emerald-600);
      }
    }
  }

  &:hover .play-circle {
    transform: scale(1.1);
  }
`;

const LikeButton = styled(Button)`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(255, 255, 255, 0.8);

  &:hover {
    background: white;
  }

  svg {
    width: 1rem;
    height: 1rem;
    color: ${(props) => (props.$liked ? "var(--rose-500)" : "var(--gray-600)")};
    fill: ${(props) => (props.$liked ? "var(--rose-500)" : "none")};
  }
`;

const NFTInfo = styled.div`
  .nft-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .nft-details {
    flex: 1;
  }

  .nft-title {
    font-size: 1.125rem;
    color: var(--gray-800);
  }

  .nft-creator {
    color: var(--gray-600);
  }

  .nft-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .nft-price {
    font-size: 1.125rem;
    font-weight: bold;
    color: var(--emerald-600);
  }
`;

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("created");
  const [isEditing, setIsEditing] = useState(false);
  const [editedBio, setEditedBio] = useState("");
  const [isUpdatingBio, setIsUpdatingBio] = useState(false);
  const { user, setUser, isInitialized, mintedNFTs } = useAppContext();
  const [marketNfts, setMarketNfts] = useState([]);
  const [isMarketLoading, setIsMarketLoading] = useState(false);
  const { showSuccess, showError } = useToast();
  
  // 오디오 재생 상태 관리
  const [playingId, setPlayingId] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (isInitialized && (!mintedNFTs || mintedNFTs.length === 0)) {
      setIsMarketLoading(true);
      ApiService.nft.getList()
        .then((res) => {
          // getList may return { success, data } or just an array
          if (Array.isArray(res)) setMarketNfts(res);
          else if (res && Array.isArray(res.data)) setMarketNfts(res.data);
          else setMarketNfts([]);
        })
        .catch(() => setMarketNfts([]))
        .finally(() => setIsMarketLoading(false));
    }
  }, [isInitialized, mintedNFTs]);

  // AppContext에서 이미 프로필 정보를 로드하므로 별도 로딩 불필요
  // useEffect는 제거하고 AppContext의 user 정보를 그대로 사용

  const getUserInitial = () => {
    if (!user) return "사";
    if (user.nickname) return user.nickname.charAt(0);
    if (user.email) return user.email.charAt(0).toUpperCase();
    return "사";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "정보 없음";
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatWalletAddress = (address) => {
    if (!address) return "지갑 연결 안됨";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const getSocialIcon = (platform) => {
    switch (platform) {
      case "kakao":
        return <KakaoIcon />;
      case "google":
        return <GoogleIcon />;
      case "naver":
        return <NaverIcon />;
      default:
        return <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>소</span>;
    }
  };

  const getSocialPlatformName = (platform) => {
    return "로그인";
  };

  const handleCopyWallet = () => {
    if (!user?.walletAddress) {
      showError("연결된 지갑이 없습니다.");
      return;
    }
    navigator.clipboard.writeText(user.walletAddress);
    showSuccess("지갑 주소가 복사되었습니다!");
  };

  const handleEditBio = () => {
    setEditedBio(user?.bio || "");
    setIsEditing(true);
  };

  const handleSaveBio = async () => {
    if (!editedBio.trim()) {
      showError("소개를 입력해주세요.");
      return;
    }

    setIsUpdatingBio(true);
    try {
      await ApiService.auth.updateProfile({
        bio: editedBio.trim()
      });
      
      // 사용자 정보 부분 업데이트 (기존 정보는 유지)
      setUser(prevUser => ({
        ...prevUser,
        bio: editedBio.trim()
      }));
      
      showSuccess("프로필이 업데이트되었습니다!");
      setIsEditing(false);
    } catch (error) {
      console.error("프로필 업데이트 오류:", error);
      showError("프로필 업데이트에 실패했습니다.");
    } finally {
      setIsUpdatingBio(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedBio("");
  };

  // 초기화가 완료되지 않았거나 사용자가 없으면 로딩 상태 표시
  if (!isInitialized || !user) {
    return (
      <PageContainer>
        <Container>
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <h2>사용자 정보를 불러오는 중...</h2>
            <p>잠시만 기다려주세요.</p>
          </div>
        </Container>
      </PageContainer>
    );
  }

  // 통계 데이터 (실제 데이터로 대체 필요)
  const stats = {
    created: mintedNFTs?.length || 0, // 실제 생성한 NFT 수
    collected: 0, // 실제 수집한 NFT 수
    sold: 0, // 실제 판매한 NFT 수
    earnings: "0 ETH", // 실제 수익
  };

  return (
    <PageContainer>
      <Container>
        <ProfileHeader>
          <div className="avatar">
            {user.profileImage || user.profileImg || user.avatar ? (
              <img 
                src={user.profileImage || user.profileImg || user.avatar} 
                alt="프로필" 
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "50%"
                }}
                onError={(e) => {
                  // 이미지 로딩 실패시 기본 아바타로 대체
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              style={{
                width: "100%",
                height: "100%",
                display: (user.profileImage || user.profileImg || user.avatar) ? 'none' : 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 'bold',
                color: 'white'
              }}
            >
              {getUserInitial()}
            </div>
          </div>
          <div className="profile-info">
            <h1>{user.nickname || user.email || "사용자"}</h1>
            <p className="username">@{user.nickname?.replace(/\s+/g, '').toLowerCase() || "user"}</p>
            
            {isEditing ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <input
                  type="text"
                  value={editedBio}
                  onChange={(e) => setEditedBio(e.target.value)}
                  placeholder="자신을 소개해보세요..."
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    border: '1px solid var(--gray-300)',
                    borderRadius: '0.25rem'
                  }}
                />
                <Button size="sm" onClick={handleSaveBio} disabled={isUpdatingBio}>
                  {isUpdatingBio ? "저장 중..." : <Check size={14} />}
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                  <X size={14} />
                </Button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <p className="bio">{user.bio || "아직 소개가 없습니다."}</p>
                <Button size="sm" variant="ghost" onClick={handleEditBio}>
                  <Edit3 size={14} />
                </Button>
              </div>
            )}

            <div className="social-platform">
              <span className={`platform-icon ${user.provider}`}>
                {getSocialIcon(user.provider)}
              </span>
              <span>로그인</span>
            </div>

            <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginTop: '0.5rem' }}>
              가입일: {formatDate(user.createdAt)}
            </div>
          </div>
          <div className="profile-actions">
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              설정
            </Button>
          </div>
        </ProfileHeader>

        <BlockchainInfo>
          <InfoCard>
            <CardContent style={{ padding: "1.5rem" }}>
              <div className="info-header">
                <span className="label">지갑 주소</span>
                {user.walletAddress && (
                  <button className="copy-btn" onClick={handleCopyWallet}>
                    <Copy />
                  </button>
                )}
              </div>
              <div className="info-value">
                {formatWalletAddress(user.walletAddress)}
              </div>
            </CardContent>
          </InfoCard>
        </BlockchainInfo>

        <StatsGrid>
          <StatCard>
            <CardContent style={{ padding: "1.5rem" }}>
              <div className="stat-icon">
                <Plus />
              </div>
              <div className="stat-number">{stats.created}</div>
              <div className="stat-label">생성한 NFT</div>
            </CardContent>
          </StatCard>

          <StatCard>
            <CardContent style={{ padding: "1.5rem" }}>
              <div className="stat-icon">
                <Heart />
              </div>
              <div className="stat-number">{stats.collected}</div>
              <div className="stat-label">수집한 NFT</div>
            </CardContent>
          </StatCard>

          <StatCard>
            <CardContent style={{ padding: "1.5rem" }}>
              <div className="stat-icon">
                <TrendingUp />
              </div>
              <div className="stat-number">{stats.sold}</div>
              <div className="stat-label">판매한 NFT</div>
            </CardContent>
          </StatCard>

          <StatCard>
            <CardContent style={{ padding: "1.5rem" }}>
              <div className="stat-icon">
                <Eye />
              </div>
              <div className="stat-number">{stats.earnings}</div>
              <div className="stat-label">총 수익</div>
            </CardContent>
          </StatCard>
        </StatsGrid>

        <TabsSection>
          <div className="tabs-list">
            <button
              className="tab-trigger"
              style={{
                backgroundColor:
                  activeTab === "created"
                    ? "var(--emerald-500)"
                    : "transparent",
                color: activeTab === "created" ? "white" : "var(--gray-700)",
              }}
              onClick={() => setActiveTab("created")}
            >
              생성한 NFT
            </button>
            <button
              className="tab-trigger"
              style={{
                backgroundColor:
                  activeTab === "collected"
                    ? "var(--emerald-500)"
                    : "transparent",
                color: activeTab === "collected" ? "white" : "var(--gray-700)",
              }}
              onClick={() => setActiveTab("collected")}
            >
              수집한 NFT
            </button>
            <button
              className="tab-trigger"
              style={{
                backgroundColor:
                  activeTab === "activity"
                    ? "var(--emerald-500)"
                    : "transparent",
                color: activeTab === "activity" ? "white" : "var(--gray-700)",
              }}
              onClick={() => setActiveTab("activity")}
            >
              활동 내역
            </button>
          </div>

          {activeTab === "created" && (
            mintedNFTs && mintedNFTs.length > 0 ? (
              <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                {mintedNFTs.map((nft) => (
                  <Card key={nft._id || nft.tokenId}>
                    <CardContent style={{ padding: '1.5rem' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{nft.title}</div>
                      <div style={{ color: 'var(--gray-600)', marginBottom: '0.5rem' }}>{nft.description}</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--gray-500)', marginBottom: '0.5rem' }}>발행일: {nft.mint_date ? new Date(nft.mint_date).toLocaleDateString('ko-KR') : '-'}</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--gray-500)' }}>가격: {nft.price?.toString?.() || nft.price || 0} ETH</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : isMarketLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>마켓플레이스 NFT를 불러오는 중...</div>
            ) : marketNfts && marketNfts.length > 0 ? (
              <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                {marketNfts.map((nft) => (
                  <Card key={nft._id || nft.tokenId}>
                    <CardContent style={{ padding: '1.5rem' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{nft.title}</div>
                      <div style={{ color: 'var(--gray-600)', marginBottom: '0.5rem' }}>{nft.description}</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--gray-500)', marginBottom: '0.5rem' }}>발행일: {nft.mint_date ? new Date(nft.mint_date).toLocaleDateString('ko-KR') : '-'}</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--gray-500)' }}>가격: {nft.price?.toString?.() || nft.price || 0} ETH</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState>
                <div className="empty-icon">
                  <Plus />
                </div>
                <h3>아직 생성한 NFT가 없습니다</h3>
                <p>첫 번째 음성 NFT를 만들어보세요!</p>
                <Button as="a" href="/create">NFT 생성하기</Button>
              </EmptyState>
            )
          )}

          {activeTab === "collected" && (
            <EmptyState>
              <div className="empty-icon">
                <Heart />
              </div>
              <h3>아직 수집한 NFT가 없습니다</h3>
              <p>마켓플레이스에서 멋진 음성 NFT를 찾아보세요!</p>
              <Button as="a" href="/marketplace">마켓플레이스 둘러보기</Button>
            </EmptyState>
          )}

          {activeTab === "activity" && (
            <EmptyState>
              <div className="empty-icon">
                <TrendingUp />
              </div>
              <h3>활동 내역이 없습니다</h3>
              <p>NFT를 생성하거나 거래하면 여기에 기록됩니다.</p>
            </EmptyState>
          )}
        </TabsSection>
      </Container>
    </PageContainer>
  );
};

export default ProfilePage;