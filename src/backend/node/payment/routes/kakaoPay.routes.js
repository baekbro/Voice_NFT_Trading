const express = require('express');
const router = express.Router();
const kakaoPayController = require('../controllers/kakaoPay.controller');

/**
 * @swagger
 * /api/payment/ready:
 *   post:
 *     summary: 카카오페이 결제 준비 요청
 *     tags:
 *       - KakaoPay
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               item_name:
 *                 type: string
 *                 example: "Voice NFT"
 *               quantity:
 *                 type: integer
 *                 example: 1
 *               total_amount:
 *                 type: integer
 *                 example: 10000
 *               tokenId:
 *                 type: string
 *                 example: "2"
 *               sellerWallet:
 *                 type: string
 *                 example: "0xaF59B4e865B1458b8Ce6088E0a72fb7834f1A936"
 *     responses:
 *       200:
 *         description: 결제 준비 완료
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 next_redirect_pc_url:
 *                   type: string
 *                   example: "https://..."
 *                 tid:
 *                   type: string
 *                   example: "T123456789"
 *       500:
 *         description: 결제 준비 실패
 */
router.post("/ready", kakaoPayController.kakaoPayReady);


/**
 * @swagger
 * /api/payment/approve:
 *   post:
 *     summary: 카카오페이 결제 승인 및 거래 기록 저장
 *     tags: [KakaoPay]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tid:
 *                 type: string
 *                 description: 카카오페이에서 받은 결제 고유 번호
 *               pg_token:
 *                 type: string
 *                 description: 결제 승인에 필요한 토큰 (카카오 리디렉션에서 전달됨)
 *               buyerWallet:
 *                 type: string
 *                 description: 구매자 지갑 주소
 *               sellerWallet:
 *                 type: string
 *                 description: 판매자 지갑 주소
 *               tokenId:
 *                 type: string
 *                 description: 거래된 NFT의 토큰 ID
 *               price:
 *                 type: number
 *                 format: float
 *                 description: 거래 금액
 *     responses:
 *       200:
 *         description: 결제 승인 및 거래 등록 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 결제 승인 및 거래 등록 완료
 *                 kakaoPay:
 *                   type: object
 *                   description: KakaoPay 결제 승인 응답 객체
 *                 trade:
 *                   $ref: '#/components/schemas/VoiceNFTTrade'
 *       500:
 *         description: 서버 오류 또는 결제 승인 실패
 */
router.post('/approve', kakaoPayController.kakaoPayApprove);

module.exports = router;
