// src/backend/node/voice_nft/models/voice_nft.model.js
const mongoose = require('mongoose');

const VoiceListSchema = new mongoose.Schema({
<<<<<<< HEAD
    tokenId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
=======
>>>>>>> 207fd0dcbeeb2e838d2332da46c49e609d67392d
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false
    },
    tags: {
        type: [String],
        required: false,
        index: true
    },
    price: {
        type: mongoose.Schema.Types.Decimal128,
        required: true
    },
    mint_date: {
        type: Date,
        default: Date.now,
        index: true
    },
    likes_count: {
        type: Number,
        default: 0,
        index: true
    },
    walletAddress: {
        type: String,
        required: true,
        index: true
    },
    imageCID: {
        type: String,
<<<<<<< HEAD
        required: true
    },
    audioCID: {
        type: String,
        required: true
    }
=======
        required: true,
      },
    audioCID: {
        type: String,
        required: true,
    },
    audioFilename: {
        type: String,
        required: false,
        default: 'unknown'
    } 
      
>>>>>>> 207fd0dcbeeb2e838d2332da46c49e609d67392d
}, {
    timestamps: true
});

// 텍스트 검색 인덱스 추가
VoiceListSchema.index({ title: 'text', description: 'text' });

const VoiceNFT = mongoose.model('VoiceNFT', VoiceListSchema);

module.exports = VoiceNFT;
