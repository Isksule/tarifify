import express from 'express';
import User from '../models/user.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Kayıt Olma
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ success: true, message: "Kullanıcı oluşturuldu" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Giriş Yapma
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, error: "Kullanıcı bulunamadı" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, error: "Hatalı şifre" });

    res.json({ success: true, message: "Giriş başarılı", email: user.email });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;