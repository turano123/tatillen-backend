const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Upload klasörünü public olarak sun
app.use('/uploads', express.static('uploads'));

// MongoDB bağlantısı
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB bağlantısı başarılı'))
  .catch((err) => console.error('MongoDB bağlantı hatası:', err));

// Schema tanımı (dikkat: weekPrice değil weekdayPrice)
const roomSchema = new mongoose.Schema({
  name: String,
  weekdayPrice: Number,
  weekendPrice: Number,
  images: [String]
});

const Room = mongoose.model('Room', roomSchema);

// Tüm odaları getir (görselleri tam URL ile döndür)
app.get('/api/rooms', async (req, res) => {
  try {
    const rooms = await Room.find();

    const updatedRooms = rooms.map(room => ({
      ...room.toObject(),
      images: room.images.map(img => `${req.protocol}://${req.get('host')}/uploads/${img}`)
    }));

    res.json(updatedRooms);
  } catch (err) {
    console.error('Odalar yüklenirken hata:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Oda ekleme endpoint'i
app.post('/api/rooms', async (req, res) => {
  try {
    const newRoom = new Room(req.body);
    await newRoom.save();
    res.json({ message: 'Oda başarıyla eklendi' });
  } catch (err) {
    console.error('Oda kaydedilirken hata:', err);
    res.status(500).json({ message: 'Kayıt hatası' });
  }
});

// Root endpoint (opsiyonel: test için)
app.get('/', (req, res) => {
  res.send('Tatillen backend aktif 🟢');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
