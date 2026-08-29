import crypto from 'crypto';

// In-memory store for active CAPTCHA sessions with TTL
const captchaStore = new Map();
const CAPTCHA_TTL_MS = 5 * 60 * 1000; // 5 minutes validity

// Auto cleanup expired captchas every 2 minutes
setInterval(() => {
    const now = Date.now();
    for (const [id, data] of captchaStore.entries()) {
        if (now - data.timestamp > CAPTCHA_TTL_MS) {
            captchaStore.delete(id);
        }
    }
}, 2 * 60 * 1000);

const CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

export const generateCaptcha = (length = 5) => {
    let text = '';
    for (let i = 0; i < length; i++) {
        text += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
    }

    const captchaId = crypto.randomBytes(16).toString('hex');
    
    // Store hashed solution in memory store with timestamp
    captchaStore.set(captchaId, {
        text: text.toUpperCase(),
        timestamp: Date.now(),
        used: false
    });

    // Generate clean SVG visual
    const width = 160;
    const height = 50;
    
    let charsSvg = '';
    const charSpacing = width / (length + 1);
    
    for (let i = 0; i < length; i++) {
        const char = text[i];
        const x = (i + 0.6) * charSpacing;
        const y = 32 + (Math.random() * 8 - 4);
        const rot = Math.floor(Math.random() * 30 - 15);
        const colors = ['#ff4c24', '#2563eb', '#059669', '#d97706', '#7c3aed', '#dc2626'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const fontSize = 24 + Math.floor(Math.random() * 6);
        
        charsSvg += `<text x="${x}" y="${y}" fill="${color}" font-size="${fontSize}" font-weight="bold" font-family="Arial, sans-serif" transform="rotate(${rot}, ${x}, ${y})">${char}</text>`;
    }

    // Generate subtle noise lines and dots
    let noiseSvg = '';
    for (let i = 0; i < 4; i++) {
        const x1 = Math.random() * width;
        const y1 = Math.random() * height;
        const x2 = Math.random() * width;
        const y2 = Math.random() * height;
        const strokeColor = i % 2 === 0 ? '#ff8466' : '#94a3b8';
        noiseSvg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${strokeColor}" stroke-width="1.2" stroke-opacity="0.6"/>`;
    }

    for (let i = 0; i < 15; i++) {
        const cx = Math.random() * width;
        const cy = Math.random() * height;
        const r = Math.random() * 2 + 0.5;
        noiseSvg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#cbd5e1" opacity="0.7" />`;
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; user-select: none;">
        <rect width="100%" height="100%" fill="#f8fafc"/>
        ${noiseSvg}
        ${charsSvg}
    </svg>`;

    return {
        captchaId,
        svg
    };
};

export const verifyCaptcha = (captchaId, userInput) => {
    if (!captchaId || !userInput) {
        return { success: false, message: "CAPTCHA solution is required." };
    }

    const record = captchaStore.get(captchaId);
    if (!record) {
        return { success: false, message: "CAPTCHA expired or invalid. Please refresh." };
    }

    if (record.used) {
        captchaStore.delete(captchaId);
        return { success: false, message: "CAPTCHA already used. Please refresh." };
    }

    if (Date.now() - record.timestamp > CAPTCHA_TTL_MS) {
        captchaStore.delete(captchaId);
        return { success: false, message: "CAPTCHA expired. Please refresh." };
    }

    // Single-use token: mark used and delete
    captchaStore.delete(captchaId);

    const isMatch = record.text === userInput.trim().toUpperCase();
    if (!isMatch) {
        return { success: false, message: "Incorrect CAPTCHA entered. Please try again." };
    }

    return { success: true };
};
