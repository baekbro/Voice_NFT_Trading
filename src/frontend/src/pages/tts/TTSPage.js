import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Button from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import Textarea from "../../components/ui/Textarea";
import Badge from "../../components/ui/Badge";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "../../components/ui/Avatar";
import { useToast } from "../../hooks/useToast";
import apiService from "../../services/api";
import {
  Play,
  Pause,
  Download,
  Volume2,
  AudioWaveform,
  Mic,
} from "lucide-react";
import Progress from "../../components/ui/Progress";

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

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;

  @media (min-width: 1024px) {
    grid-template-columns: 1fr 2fr;
  }
`;

const StyledCard = styled(Card)`
  border: none;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
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

const VoiceItem = styled.div`
  padding: 1rem;
  border-radius: 12px;
  border: 2px solid ${(props) => (props.selected ? "#10b981" : "#e5e7eb")};
  background: ${(props) => (props.selected ? "#f0fdf4" : "white")};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    border-color: #34d399;
  }
`;

const VoiceContent = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const VoiceInfo = styled.div`
  flex: 1;
`;

const VoiceTitle = styled.h4`
  font-weight: 500;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
`;

const VoiceCreator = styled.p`
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
`;

const VoiceBadges = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.25rem;
  align-items: center;
`;

const OwnedBadge = styled(Badge)`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  font-size: 0.625rem;
  background: #10b981;
  color: white;
  border: none;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;

  svg {
    width: 3rem;
    height: 3rem;
    margin: 0 auto 1rem;
    color: #d1d5db;
  }

  p {
    color: #6b7280;
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }
`;

const TextInputContainer = styled.div`
  margin-bottom: 1.5rem;
`;

const TextMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
`;

const CharCount = styled.span`
  font-size: 0.75rem;
  color: #6b7280;
`;

const TextActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const GenerateButton = styled(Button)`
  flex: 1;
  background: linear-gradient(135deg, #10b981, #0891b2);
  border: none;

  &:hover {
    background: linear-gradient(135deg, #059669, #0e7490);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const AudioPlayer = styled(StyledCard)`
  border: 1px solid #10b981;
  background: #f0fdf4;
  margin-top: 1.5rem;
`;

const PlayerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const PlayerControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const ProgressBar = styled.div`
  flex: 1;
  height: 8px;
  background: #bbf7d0;
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: #10b981;
  width: 33%;
  border-radius: 4px;
`;

const TimeDisplay = styled.span`
  font-size: 0.875rem;
  color: #6b7280;
`;

const PlayerActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const TipCard = styled.div`
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  padding: 1rem;
  margin-top: 1.5rem;
`;

const TipTitle = styled.h4`
  font-weight: 500;
  color: #1e40af;
  margin-bottom: 0.5rem;
`;

const TipList = styled.ul`
  font-size: 0.875rem;
  color: #1e40af;
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    margin-bottom: 0.25rem;
  }
`;

function TTSPage() {
  const { showPromise, showSuccess, showError } = useToast();

  // 실제 로그인/연결된 지갑 주소 가져오기 (예시)
  const walletAddress = localStorage.getItem("walletAddress");

  const [selectedVoice, setSelectedVoice] = useState("");
  const [inputText, setInputText] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [ownedVoices, setOwnedVoices] = useState([]);
  const [audioUrl, setAudioUrl] = useState("");
  const [audioObj, setAudioObj] = useState(null);
  const [audioGenerationProgress, setAudioGenerationProgress] = useState(0);

  // 마켓플레이스에서 모든 음성 NFT 불러오기
  useEffect(() => {
    apiService.nft.getList()
      .then((res) => {
        const nftList = res.nfts || res.data || res || [];
        // 음성 관련 NFT만 필터링 (audioCID가 있는 것들)
        const voiceNfts = nftList.filter((nft) => nft.audioCID);
        // ownedVoices 포맷 맞추기
        setOwnedVoices(
          voiceNfts.map((nft) => ({
            id: nft._id || nft.id,
            title: nft.title,
            creator: nft.creator || `@${nft.walletAddress?.slice(0, 8)}...`,
            type: nft.tags?.[0] || "음성 NFT",
            language: nft.language || "한국어",
            image: nft.imageUrl,
            audioCID: nft.audioCID,
            isOwned: nft.walletAddress?.toLowerCase() === walletAddress?.toLowerCase(),
          }))
        );
      })
      .catch(() => setOwnedVoices([]));
  }, [walletAddress]);

  const handleGenerate = async () => {
    if (!selectedVoice || !inputText.trim()) {
      showError("음성과 텍스트를 모두 선택해주세요.");
      return;
    }
    setIsGenerating(true);
    setAudioUrl("");
    setAudioObj(null);
    setAudioGenerationProgress(0);
    let progressInterval;
    try {
      // CreatePage와 동일하게 userId 추출
      let userId = "temp_user";
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          userId = payload.id || payload.kakaoId || payload._id || "temp_user";
        } catch (e) {}
      }
      // 진행률 시뮬레이션 (초반 빠르게, 후반 천천히)
      progressInterval = setInterval(() => {
        setAudioGenerationProgress((prev) => {
          if (prev >= 85) {
            clearInterval(progressInterval);
            return 85;
          }
          const increment = prev < 30 ? 8 : prev < 60 ? 5 : 3;
          return prev + increment;
        });
      }, 300);
      const ttsResult = await showPromise(
        apiService.tts.generateSpeechBlob(userId, inputText),
        {
          loading: "AI가 음성을 생성하고 있습니다...",
          success: "음성이 성공적으로 생성되었습니다!",
          error: "음성 생성에 실패했습니다. 다시 시도해주세요.",
        }
      );
      clearInterval(progressInterval);
      setAudioGenerationProgress(100);
      if (ttsResult && ttsResult.blob) {
        const url = URL.createObjectURL(ttsResult.blob);
        setAudioUrl(url);
        setAudioObj(new Audio(url));
      } else {
        showError("음성 생성 결과가 올바르지 않습니다.");
      }
    } catch (error) {
      clearInterval(progressInterval);
      setAudioGenerationProgress(0);
      console.error("TTS generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlay = () => {
    if (!audioUrl) return;
    if (!audioObj) {
      const newAudio = new Audio(audioUrl);
      setAudioObj(newAudio);
      newAudio.play();
      setIsPlaying(true);
      newAudio.onended = () => setIsPlaying(false);
    } else {
      if (isPlaying) {
        audioObj.pause();
        setIsPlaying(false);
      } else {
        audioObj.play();
        setIsPlaying(true);
        audioObj.onended = () => setIsPlaying(false);
      }
    }
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = "generated_tts.wav";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showSuccess("음성 파일 다운로드가 시작되었습니다.");
  };

  return (
    <PageContainer>
      <Container>
        {/* Header */}
        <Header>
          <Title>AI 음성 TTS 스튜디오</Title>
          <Description>
            소유한 음성 NFT로 텍스트를 자연스러운 음성으로 변환하세요
          </Description>
        </Header>

        <GridContainer>
          {/* Left Panel - Voice Selection */}
          <div>
            <StyledCard>
              <CardHeader>
                <CardTitle>
                  <Mic size={20} />마켓플레이스 음성 NFT
                </CardTitle>
                <CardDescription>
                  사용할 음성을 선택하세요
                </CardDescription>
              </CardHeader>
              <CardContent style={{ padding: "0 1.5rem 1.5rem" }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  {ownedVoices.map((voice) => (
                    <VoiceItem
                      key={voice.id}
                      selected={selectedVoice === voice.id}
                      onClick={() => setSelectedVoice(voice.id)}
                    >
                      {voice.isOwned && (
                        <OwnedBadge>내 소유</OwnedBadge>
                      )}
                      <VoiceContent>
                        <Avatar style={{ width: "3rem", height: "3rem" }}>
                          <AvatarImage src={voice.image || "/placeholder-user.jpg"} alt={voice.creator} />
                          <AvatarFallback>
                            {voice.creator.replace("@", "").charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <VoiceInfo>
                          <VoiceTitle>{voice.title}</VoiceTitle>
                          <VoiceCreator>{voice.creator}</VoiceCreator>
                          <VoiceBadges>
                            <Badge
                              variant="outline"
                              style={{ fontSize: "0.75rem" }}
                            >
                              {voice.type}
                            </Badge>
                            <Badge
                              variant="outline"
                              style={{ fontSize: "0.75rem" }}
                            >
                              {voice.language}
                            </Badge>
                          </VoiceBadges>
                        </VoiceInfo>
                      </VoiceContent>
                    </VoiceItem>
                  ))}

                  {ownedVoices.length === 0 && (
                    <EmptyState>
                      <AudioWaveform />
                      <p>사용 가능한 음성 NFT가 없습니다</p>
                      <Button variant="outline" size="sm">
                        마켓플레이스에서 확인하기
                      </Button>
                    </EmptyState>
                  )}
                </div>
              </CardContent>
            </StyledCard>
          </div>

          {/* Right Panel - Text Input and Generation */}
          <div>
            <StyledCard>
              <CardHeader>
                <CardTitle>
                  <AudioWaveform size={20} />
                  텍스트 입력
                </CardTitle>
              </CardHeader>
              <CardContent style={{ padding: "0 1.5rem 1.5rem" }}>
                <TextInputContainer>
                  <Textarea
                    placeholder="여기에 음성으로 변환할 텍스트를 입력하세요..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    rows={8}
                    style={{
                      borderColor: "#bbf7d0",
                      resize: "none",
                    }}
                  />
                  <TextMeta>
                    <CharCount>{inputText.length} / 1000 글자</CharCount>
                    <TextActions>
                      <Button variant="outline" size="sm">
                        샘플 텍스트
                      </Button>
                      <Button variant="outline" size="sm">
                        파일에서 불러오기
                      </Button>
                    </TextActions>
                  </TextMeta>
                </TextInputContainer>

                <GenerateButton
                  onClick={handleGenerate}
                  disabled={!selectedVoice || !inputText.trim() || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <AudioWaveform
                        size={16}
                        style={{ marginRight: "0.5rem" }}
                      />
                      생성 중...
                    </>
                  ) : (
                    <>
                      <AudioWaveform
                        size={16}
                        style={{ marginRight: "0.5rem" }}
                      />
                      음성 생성하기
                    </>
                  )}
                </GenerateButton>

                {/* Generated Audio Player */}
                {isGenerating && (
                  <div style={{ margin: "1.5rem 0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <AudioWaveform size={20} />
                      <span style={{ fontWeight: 500 }}>음성 생성 중... {audioGenerationProgress}%</span>
                    </div>
                    <Progress value={audioGenerationProgress} style={{ marginTop: 8 }} />
                  </div>
                )}
                {!isGenerating && audioUrl && (
                  <AudioPlayer>
                    <CardContent style={{ padding: "1.5rem" }}>
                      <PlayerHeader>
                        <h3 style={{ fontWeight: 500, margin: 0 }}>
                          생성된 음성
                        </h3>
                        <Badge
                          variant="outline"
                          style={{
                            borderColor: "#bbf7d0",
                            color: "#059669",
                          }}
                        >
                          준비됨
                        </Badge>
                      </PlayerHeader>

                      <PlayerControls>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePlay}
                          disabled={!audioUrl}
                          style={{
                            borderColor: "#bbf7d0",
                            color: "#059669",
                            background: "transparent",
                          }}
                        >
                          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                        </Button>
                        {/* ProgressBar 대체: 실제 오디오 길이로 구현하려면 추가 작업 필요 */}
                        <div style={{ flex: 1 }} />
                        <TimeDisplay> </TimeDisplay>
                      </PlayerControls>

                      <PlayerActions>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDownload}
                          disabled={!audioUrl}
                          style={{
                            borderColor: "#bbf7d0",
                            color: "#059669",
                            background: "transparent",
                          }}
                        >
                          <Download
                            size={16}
                            style={{ marginRight: "0.5rem" }}
                          />
                          다운로드
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          style={{
                            borderColor: "#bbf7d0",
                            color: "#059669",
                            background: "transparent",
                          }}
                        >
                          <Volume2
                            size={16}
                            style={{ marginRight: "0.5rem" }}
                          />
                          공유하기
                        </Button>
                      </PlayerActions>
                    </CardContent>
                  </AudioPlayer>
                )}

                {/* Usage Info */}
                <TipCard>
                  <TipTitle>💡 사용 팁</TipTitle>
                  <TipList>
                    <li>
                      • 문장 부호를 적절히 사용하면 더 자연스러운 음성이
                      생성됩니다
                    </li>
                    <li>
                      • 긴 텍스트는 문단별로 나누어 생성하는 것을 권장합니다
                    </li>
                    <li>• 생성된 음성은 상업적 용도로도 사용 가능합니다</li>
                    <li>• 마켓플레이스의 모든 음성 NFT를 TTS에 활용할 수 있습니다</li>
                  </TipList>
                </TipCard>
              </CardContent>
            </StyledCard>
          </div>
        </GridContainer>
      </Container>
    </PageContainer>
  );
}

export default TTSPage;
