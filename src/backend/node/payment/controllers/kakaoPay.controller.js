const {
    requestKakaoPayReady,
    requestKakaoPayApprove,
} = require('../services/kakaoPay.service');
const VoiceNFTTrade = require('../../NFT/models/voice_nft_trade.model');
const ReadyPayment = require('../models/ready_payment.model');

exports.kakaoPayReady = async (req, res) => {
    try {
        const { item_name, quantity, total_amount, tokenId, sellerWallet } = req.body;
        console.log('🔍 KakaoPay Ready 요청:', req.body);
        // 숫자들을 문자열로 변환해서 전달
        const result = await requestKakaoPayReady({
            item_name: item_name || 'NFT 결제',
            quantity: String(quantity),
            total_amount: String(total_amount*100)
        });
        
        
        // 💾 DB에 tid-tokenId-sellerWallet-price 저장
        await ReadyPayment.create({
            tid: result.tid,
            tokenId,
            sellerWallet,
            price,
        });
        console.log('✅ KakaoPay Ready 응답:', result);
        res.json({
            next_redirect_pc_url: result.next_redirect_pc_url,
            tid: result.tid
        });
        console.log(next_redirect_pc_url)
        
    } catch (error) {
        if (error.response) {
            // 카카오에서 응답 자체는 왔지만 오류인 경우
            console.error('❌ KakaoPay Ready Response Error:', error.response.data);
            return res.status(500).json({ error: error.response.data });
        } else {
            // 네트워크 오류, 코드 오류 등
            console.error('❌ KakaoPay Ready Unknown Error:', error.message);
            return res.status(500).json({ error: '결제 준비 실패' });
        }
    }
};



exports.kakaoPayApprove = async (req, res) => {
    try {
        const { tid, pg_token, buyerWallet } = req.body;

        // 1. 카카오페이 결제 승인
        const kakaoRes = await requestKakaoPayApprove({ tid, pg_token });

        // 2. 준비 단계에서 저장한 거래 정보 불러오기
        const ready = await ReadyPayment.findOne({ tid });
        if (!ready) {
            return res.status(404).json({ error: '결제 준비 정보 없음' });
        }

        // 3. 거래 기록 저장
        const trade = await VoiceNFTTrade.create({
            tokenId: ready.tokenId,
            sellerWallet: ready.sellerWallet,
            buyerWallet,
            price: ready.price,
            tradeDate: new Date()
        });

        // 4. (선택) ReadyPayment 제거
        await ReadyPayment.deleteOne({ tid });

        res.json({
            message: '결제 승인 및 거래 등록 완료',
            kakaoPay: kakaoRes,
            trade
        });
    } catch (error) {
        console.error('❌ KakaoPay Approve Error:', error.message);
        res.status(500).json({ error: '결제 승인 실패' });
    }
};