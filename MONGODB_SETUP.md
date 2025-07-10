# MongoDB 설치 및 설정 가이드

## 1. MongoDB Community Edition 설치

### Windows에서 설치하기

1. **MongoDB Community Server 다운로드**
   - https://www.mongodb.com/try/download/community 에서 다운로드
   - Windows x64 버전 선택
   - "Complete" 설치 옵션 선택

2. **설치 과정**
   - 설치 경로: `C:\Program Files\MongoDB\Server\7.0\`
   - MongoDB Compass (GUI 도구) 함께 설치 권장
   - 서비스로 설치 (자동 시작)

3. **환경 변수 설정**
   - 시스템 환경 변수에 `C:\Program Files\MongoDB\Server\7.0\bin` 추가
   - PATH에 추가하여 `mongod` 명령어 사용 가능하게 함

## 2. MongoDB 서비스 시작

### 방법 1: 서비스로 시작 (권장)
```bash
# Windows 서비스 관리자에서 "MongoDB" 서비스 시작
# 또는 명령 프롬프트에서:
net start MongoDB
```

### 방법 2: 수동으로 시작
```bash
# 데이터 디렉토리 생성
mkdir C:\data\db

# MongoDB 시작
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath="C:\data\db"
```

## 3. 연결 테스트

```bash
# MongoDB 쉘 접속
"C:\Program Files\MongoDB\Server\7.0\bin\mongosh.exe"

# 또는 MongoDB Compass 사용
# mongodb://localhost:27017
```

## 4. 프로젝트에서 사용

환경 변수 설정 (선택사항):
```bash
# .env 파일에 추가
MONGO_URI=mongodb://localhost:27017/voice_nft_trading
```

## 5. 문제 해결

### MongoDB가 시작되지 않는 경우:
1. 포트 27017이 사용 중인지 확인
2. 데이터 디렉토리 권한 확인
3. 방화벽 설정 확인

### 연결 오류가 발생하는 경우:
1. MongoDB 서비스가 실행 중인지 확인
2. `netstat -an | findstr 27017`로 포트 확인
3. MongoDB Compass로 연결 테스트

## 6. 대안: MongoDB Atlas (클라우드)

로컬 설치가 어려운 경우 MongoDB Atlas 사용:
1. https://www.mongodb.com/atlas 에서 무료 계정 생성
2. 클러스터 생성
3. 연결 문자열을 환경 변수로 설정 