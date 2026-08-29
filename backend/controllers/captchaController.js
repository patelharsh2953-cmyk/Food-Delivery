import { generateCaptcha, verifyCaptcha } from "../utils/captcha.js";

export const getCaptcha = async (req, res) => {
    try {
        const { captchaId, svg } = generateCaptcha(5);
        res.json({
            success: true,
            captchaId,
            svg
        });
    } catch (error) {
        console.error("Captcha generation error:", error);
        res.status(500).json({ success: false, message: "Error generating CAPTCHA." });
    }
};

export const checkCaptcha = async (req, res) => {
    try {
        const { captchaId, captchaValue } = req.body;
        const result = verifyCaptcha(captchaId, captchaValue);
        if (result.success) {
            return res.json({ success: true, message: "CAPTCHA verified successfully." });
        } else {
            return res.status(400).json({ success: false, message: result.message });
        }
    } catch (error) {
        console.error("Captcha verify error:", error);
        res.status(500).json({ success: false, message: "Error verifying CAPTCHA." });
    }
};
