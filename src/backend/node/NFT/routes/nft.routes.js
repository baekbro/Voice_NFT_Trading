const express = require("express");
const router = express.Router();
const nftController = require("../controllers/nft.controller");
const voiceListController = require("../controllers/voiceList.controller");

/**
 * @swagger
 * /api/nft/mint:
 *   post:
 *     summary: 스마트 컨트랙트 배포 및 ABI 복사
 *     tags:
 *       - VoiceNFT
 *     description: Truffle을 통해 스마트 컨트랙트를 재배포하고, ABI 파일을 프론트엔드 경로로 복사합니다.
 *     responses:
 *       200:
 *         description: 배포 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "✅ 자동 배포 및 ABI 복사 완료"
 *                 stdout:
 *                   type: string
 *                   example: "Compiling your contracts...\n...\n"
 *       500:
 *         description: 배포 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "배포 실패"
 *                 details:
 *                   type: string
 *                   example: "Error: ENOENT: no such file or directory, ..."
 */
router.post("/mint", nftController.mintNFT);
router.post("/save", nftController.saveNFT);
router.get("/voiceList", voiceListController.getNFTs);
router.get("/voiceList/:id", nftController.getNFTById);
/**
 * @swagger
 * /api/nft/save:
 *   post:
 *     summary: 민팅된 NFT 정보를 DB에 저장
 *     tags:
 *       - VoiceNFT
 *     description: 스마트 컨트랙트를 통해 민팅한 NFT의 메타데이터를 데이터베이스에 저장합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "My NFT Title"
 *               description:
 *                 type: string
 *                 example: "이 NFT는 음성 파일을 기반으로 생성되었습니다."
 *               price:
 *                 type: string
 *                 example: "0.1"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["audio", "voice", "unique"]
 *     responses:
 *       200:
 *         description: 저장 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "✅ NFT 정보 저장 완료"
 *       500:
 *         description: 저장 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "DB 저장 중 오류 발생"
 *                 details:
 *                   type: string
 *                   example: "ValidationError: title cannot be null"
 */
/**
 * @swagger
 * /api/nft/voiceList:
 *   get:
 *     summary: Voice NFT 목록 조회
 *     tags:
 *       - VoiceNFT
 *     description: "필터링, 정렬, 키워드 검색을 포함한 NFT 목록을 조회합니다."
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: "제목/설명 키워드 검색"
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: "쉼표로 구분된 태그들 (예: music,funny)"
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: "최소 가격"
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: "최대 가격"
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [mint_date, likes_count, price]
 *         description: "정렬 기준"
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: "정렬 방향"
 *     responses:
 *       200:
 *         description: "성공"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/VoiceNFT'
 *       500:
 *         description: "NFT 검색/조회 실패"
 */
router.get("/voiceList", voiceListController.getNFTs);

/**
 * @swagger
 * /api/nft/voiceList/{id}:
 *   get:
 *     summary: 특정 Voice NFT 상세 조회
 *     tags:
 *       - VoiceNFT
 *     description: ID를 기반으로 특정 Voice NFT의 상세 정보를 반환합니다.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 조회할 NFT의 ID
 *     responses:
 *       200:
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VoiceNFT'
 *       404:
 *         description: 해당 Token ID의 NFT가 존재하지 않음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "해당 Token ID의 NFT가 존재하지 않습니다."
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "서버 오류"
 *                 details:
 *                   type: string
 */
router.get("/voiceList/:id", nftController.getNFTById);
// 반드시 export 해줘야 외부에서 사용 가능
module.exports = router;
