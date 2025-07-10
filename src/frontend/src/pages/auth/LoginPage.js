import React from "react";
import styled from "styled-components";
import { Sparkles } from "lucide-react";
import Button from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useToast } from "../../hooks/useToast";
import { useAuth } from "../../hooks/useAuth";
import { startSocialLogin } from "../../utils/auth";

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    #f0fdfa 0%,
    #ffffff 35%,
    #f0f9ff 65%,
    #ecfdf5 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
        circle at 20% 50%,
        rgba(16, 185, 129, 0.05) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 80% 20%,
        rgba(6, 182, 212, 0.05) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 40% 80%,
        rgba(34, 197, 94, 0.05) 0%,
        transparent 50%
      );
    pointer-events: none;
  }
`;

const Container = styled.div`
  width: 100%;
  max-width: 420px;
  position: relative;
  z-index: 1;
`;

const LoginCard = styled(Card)`
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 32px 64px -12px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  overflow: hidden;
`;

const CardHeader = styled.div`
  background: linear-gradient(
    135deg,
    rgba(16, 185, 129, 0.02) 0%,
    rgba(6, 182, 212, 0.02) 100%
  );
  padding: 2.5rem 2rem 1.5rem;
  text-align: center;
  border-bottom: 1px solid rgba(16, 185, 129, 0.08);
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const LogoIcon = styled.div`
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, #10b981, #0891b2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.125rem;
  box-shadow: 0 8px 25px -8px rgba(16, 185, 129, 0.4);
  position: relative;

  &::after {
    content: "";
    position: absolute;
    inset: -2px;
    background: linear-gradient(135deg, #10b981, #0891b2);
    border-radius: 14px;
    z-index: -1;
    opacity: 0.2;
  }
`;

const LogoText = styled.h1`
  font-size: 1.75rem;
  font-weight: 800;
  background: linear-gradient(135deg, #065f46, #0e7490);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.025em;
`;

const WelcomeSection = styled.div`
  margin-bottom: 1rem;
`;

const WelcomeTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.75rem;
  line-height: 1.3;
  letter-spacing: -0.025em;
`;

const WelcomeDescription = styled.p`
  color: #6b7280;
  font-size: 0.9rem;
  line-height: 1.5;
  font-weight: 500;
`;

const CardBody = styled.div`
  padding: 2rem;
`;

const SectionDivider = styled.div`
  display: flex;
  align-items: center;
  margin: 0 0 1.5rem;

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
  }
`;

const DividerText = styled.span`
  padding: 0 1.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #9ca3af;
  background: rgba(255, 255, 255, 0.8);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const SocialOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const SocialButton = styled(Button)`
  width: 100%;
  justify-content: center;
  padding: 1rem 1.5rem;
  height: auto;
  font-weight: 600;
  font-size: 0.9rem;
  border-radius: 12px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }

  &.kakao {
    background: #fee500;
    border: none;
    color: #000000;
    box-shadow: 0 4px 15px rgba(254, 229, 0, 0.3);

    &:hover {
      background: #ffeb3b;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(254, 229, 0, 0.4);
    }
  }

  &.google {
    background: #ffffff;
    border: 1px solid #dadce0;
    color: #3c4043;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);

    &:hover {
      background: #f8f9fa;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
  }

  &.naver {
    background: #03c75a;
    border: none;
    color: white;
    box-shadow: 0 4px 15px rgba(3, 199, 90, 0.3);

    &:hover {
      background: #02b351;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(3, 199, 90, 0.4);
    }
  }
`;

const SocialIcon = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;

  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
`;

const KakaoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 3C7.03 3 3 6.14 3 10.1c0 2.5 1.37 4.75 3.48 6.1L5.8 19.5c-.15.4.26.77.64.58l3.32-1.74c.72.1 1.47.16 2.24.16 4.97 0 9-3.14 9-7.1S16.97 3 12 3z"
      fill="#3C1E1E"
    />
  </svg>
);

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="4" fill="#03C75A" />
    <path
      d="M16.273 12.845L7.376 0H0V24H7.727V11.155L16.624 24H24V0H16.273V12.845Z"
      fill="white"
    />
  </svg>
);

const Footer = styled.div`
  text-align: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(16, 185, 129, 0.1);
`;

const FooterText = styled.p`
  font-size: 0.75rem;
  color: #9ca3af;
  line-height: 1.5;
  font-weight: 500;
`;

function LoginPage() {
  const { showLoginSuccess, showLoginError, showLoading, dismissById } =
    useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // 이미 로그인된 경우 리다이렉트 처리
  React.useEffect(() => {
    if (isAuthenticated) {
      // 로그인 후 이동할 페이지 확인
      const redirectPath =
        localStorage.getItem("redirectAfterLogin") || "/dashboard";
      localStorage.removeItem("redirectAfterLogin");
      window.location.href = redirectPath;
    }
  }, [isAuthenticated]);

  const handleSocialLogin = (platform) => {
    console.log(`${platform}으로 로그인 시도`);

    // 로딩 토스트 표시
    const loadingToastId = showLoading(`${platform}으로 로그인 중...`);

    try {
      // 백엔드 OAuth 엔드포인트로 리다이렉트
      const platformMap = {
        kakao: "kakao",
        google: "google",
        naver: "naver",
        kakao: "kakao",
        google: "google",
        naver: "naver",
      };

      startSocialLogin(platformMap[platform] || platform);
    } catch (error) {
      dismissById(loadingToastId);
      showLoginError();
      console.error("소셜 로그인 오류:", error);
    }
  };

  // 로딩 중이면 로딩 화면 표시
  if (isLoading) {
    return (
      <PageContainer>
        <Container>
          <LoginCard>
            <CardBody style={{ textAlign: "center", padding: "3rem" }}>
              <div>로그인 상태를 확인하는 중...</div>
            </CardBody>
          </LoginCard>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Container>
        <LoginCard>
          <CardHeader>
            <Logo>
              <LogoIcon>
                <Sparkles size={18} />
              </LogoIcon>
              <LogoText>음성NFT</LogoText>
            </Logo>

            <WelcomeSection>
              <WelcomeTitle>음성 NFT의 새로운 세계로</WelcomeTitle>
              <WelcomeDescription>
                블록체인 기반의 독특한 음성 컬렉션을 만나보세요
              </WelcomeDescription>
            </WelcomeSection>
          </CardHeader>

          <CardBody>
            <SectionDivider>
              <DividerText>소셜 로그인</DividerText>
            </SectionDivider>

            <SocialOptions>
              <SocialButton
                className="kakao"
                onClick={() => handleSocialLogin("kakao")}
              >
                <SocialIcon>
                  <KakaoIcon />
                  카카오톡으로 시작하기
                </SocialIcon>
              </SocialButton>

            </SocialOptions>

            <Footer>
              <FooterText>
                로그인 시 <strong>이용약관</strong> 및{" "}
                <strong>개인정보처리방침</strong>에<br />
                동의하는 것으로 간주됩니다
              </FooterText>
            </Footer>
          </CardBody>
        </LoginCard>
      </Container>
    </PageContainer>
  );
}

export default LoginPage;
