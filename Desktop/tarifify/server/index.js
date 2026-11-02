import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

app.post('/api/parse-recipe', upload.single('file'), async (req, res) => {
  try {
    const rawText = req.body.rawText || '';
    const file = req.file;

    if (!rawText.trim() && !file) {
      return res.status(400).json({
        success: false,
        error: 'Lütfen bir tarif metni girin veya bir görsel/video dosyası yükleyin.'
      });
    }

    const contents = [];

    const promptText = `
    Aşağıda sana verilen metni, görseli veya video/ses kaydını dikkatlice analiz et.
    İçerikteki yemek tarifini tespit ederek SADECE saf bir JSON objesi döndür.
    Asla açıklama metni, markdown veya tırnak işareti ekleme.

    İstenen JSON Yapısı:
    {
      "title": "Yemeğin Adı",
      "time": "Hazırlık ve pişirme süresi (ör: 30 dk)",
      "servings": "Kaç Kişilik (ör: 4 Kişilik)",
      "ingredients": [
        "1. malzeme ve miktarı",
        "2. malzeme ve miktarı"
      ],
      "steps": [
        "1. adım açıklaması",
        "2. adım açıklaması"
      ]
    }
    `;

    if (rawText.trim()) {
      contents.push(rawText);
    }

    if (file) {
      contents.push({
        inlineData: {
          mimeType: file.mimetype,
          data: file.buffer.toString('base64')
        }
      });
    }

    contents.push(promptText);

   const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
    });

    let responseText = response.text || '';
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

    const recipeData = JSON.parse(responseText);

    res.json({ success: true, data: recipeData });

  } catch (error) {
    console.error('SERVER HATA DETAYI:', error);
    res.status(500).json({
      success: false,
      error: 'Tarif ayrıştırılırken bir hata oluştu.',
      details: error.message
    });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Tarifify Backend ${PORT} portunda kişisel kullanım için hazır!`);
});