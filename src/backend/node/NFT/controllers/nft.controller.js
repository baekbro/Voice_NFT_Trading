const axios = require("axios");
const path = require("path");
const { exec } = require("child_process");
const VoiceNFT = require("../models/voiceList.model"); // ✅ 모델 불러오기

// Truffle 자동 배포 + ABI 복사
exports.mintNFT = (req, res) => {
  const rootPath = path.resolve(__dirname, "../");
  const trufflePath = path.join(rootPath, "truffle-project");
  const frontendPath = path.join(rootPath, "front/src/contracts");

  const command = `
        cd "${trufflePath}" && \
        truffle migrate --reset && \
        cp build/contracts/MyAudioNFT.json "${frontendPath}"
    `;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("❌ 배포 오류:", error);
      return res.status(500).json({
        error: "배포 실패",
        details: stderr.toString(),
      });
    }

    console.log("✅ 배포 완료\n", stdout);
    return res.status(200).json({
      message: "✅ 자동 배포 및 ABI 복사 완료",
      stdout: stdout.toString(),
    });
  });
};

// NFT 정보 DB 저장
exports.saveNFT = async (req, res) => {
  try {
    const { title, description, tags, price, walletAddress, imageCID, audioCID, audioFilename } = req.body;

    if (!title || !price) {
      return res
        .status(400)
        .json({ error: "필수 필드 누락(title, price)" });
    }

    const newNFT = new VoiceNFT({
      title,
      description,
      tags,
      price,
      mint_date: new Date(),
      walletAddress,
      imageCID: imageCID,
      audioCID: audioCID,
      audioFilename: audioFilename || 'unknown'
    });

    await newNFT.save();

    return res.status(201).json({
      message: "✅ NFT 메타데이터 DB 저장 완료",
      data: newNFT,
    });
  } catch (err) {
    console.error("❌ DB 저장 오류:", err);
    return res.status(500).json({
      error: "서버 오류",
      details: err.message,
    });
  }
};


// NFT 목록 조회
exports.getNFTList = async (req, res) => {
  try {
    const list = await VoiceNFT.find().sort({ mint_date: -1 });
    return res.status(200).json(list);
  } catch (err) {
    console.error("❌ NFT 목록 불러오기 실패:", err);
    return res.status(500).json({
      error: "서버 오류",
      details: err.message,
    });
  }
};

exports.getNFTById = async (req, res) => {
  const { id } = req.params;

  try {
    const nft = await VoiceNFT.findById(id);

    if (!nft) {
      return res.status(404).json({ message: '해당 ID의 NFT가 존재하지 않습니다.' });
    }

    // Decimal128 타입의 price를 숫자로 변환
    const nftData = nft.toObject();
    console.log('원본 NFT 데이터:', JSON.stringify(nftData, null, 2));
    
    if (nftData.price) {
      if (nftData.price.$numberDecimal) {
        nftData.price = parseFloat(nftData.price.$numberDecimal);
      } else if (typeof nftData.price === 'object' && nftData.price.toString) {
        nftData.price = parseFloat(nftData.price.toString());
      }
    }
    
    console.log('변환된 NFT 데이터:', JSON.stringify(nftData, null, 2));

    return res.status(200).json(nftData);
  } catch (error) {
    console.error('❌ NFT 조회 오류:', error);
    return res.status(500).json({ error: '서버 오류', details: error.message });
  }
};