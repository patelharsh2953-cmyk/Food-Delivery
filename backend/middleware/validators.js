import validator from 'validator';

export const validateUserRegister = (req, res, next) => {
    const { name, email, password } = req.body;

    if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: "Full Name is required." });
    }

    if (!email || !validator.isEmail(email.trim())) {
        return res.status(400).json({ success: false, message: "A valid email address is required." });
    }

    if (!password || password.length < 8) {
        return res.status(400).json({ success: false, message: "Password must be at least 8 characters long." });
    }

    req.body.name = name.trim();
    req.body.email = email.trim().toLowerCase();
    next();
};

export const validateUserRegistration = validateUserRegister;

export const validateUserLogin = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    if (!validator.isEmail(email.trim())) {
        return res.status(400).json({ success: false, message: "Please provide a valid email format." });
    }

    req.body.email = email.trim().toLowerCase();
    next();
};

export const validateFoodItem = (req, res, next) => {
    const { name, description, price, category } = req.body;

    if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: "Product name is required." });
    }

    if (!description || !description.trim()) {
        return res.status(400).json({ success: false, message: "Product description is required." });
    }

    if (price === undefined || isNaN(Number(price)) || Number(price) <= 0) {
        return res.status(400).json({ success: false, message: "Valid positive price is required." });
    }

    if (!category || !category.trim()) {
        return res.status(400).json({ success: false, message: "Category is required." });
    }

    req.body.name = name.trim();
    req.body.description = description.trim();
    req.body.price = Number(price);
    req.body.category = category.trim();
    next();
};

export const validateContact = (req, res, next) => {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: "Full Name is required." });
    }

    if (!email || !validator.isEmail(email.trim())) {
        return res.status(400).json({ success: false, message: "A valid email address is required." });
    }

    if (!phone || !phone.trim() || phone.trim().length < 7) {
        return res.status(400).json({ success: false, message: "Valid phone number is required." });
    }

    if (!subject || !subject.trim()) {
        return res.status(400).json({ success: false, message: "Subject is required." });
    }

    if (!message || message.trim().length < 5) {
        return res.status(400).json({ success: false, message: "Message must be at least 5 characters." });
    }

    req.body.name = name.trim();
    req.body.email = email.trim().toLowerCase();
    req.body.phone = phone.trim();
    req.body.subject = subject.trim();
    req.body.message = message.trim();
    next();
};

export const validateContactForm = validateContact;

export const validateOffer = (req, res, next) => {
    const { code, discount, expiryDate } = req.body;

    if (!code || !code.trim()) {
        return res.status(400).json({ success: false, message: "Coupon code is required." });
    }

    if (discount === undefined || isNaN(Number(discount)) || Number(discount) <= 0 || Number(discount) > 100) {
        return res.status(400).json({ success: false, message: "Discount must be between 1% and 100%." });
    }

    if (!expiryDate) {
        return res.status(400).json({ success: false, message: "Expiry date is required." });
    }

    req.body.code = code.trim().toUpperCase();
    req.body.discount = Number(discount);
    next();
};

export const validateCoupon = validateOffer;
