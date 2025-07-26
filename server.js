const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Görsellerin erişilebilir olması için bu satırı ekliyoruz
app.use('/uploads', express.static('uploads'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB bağlantısı başarılı'))
  .catch((err) => console.error('MongoDB bağlantı hatası:', err));

const roomSchema = new mongoose.Schema({
  name: String,
  weekPrice: Number,
  weekendPrice: Number,
  images: [String]
});

const Room = mongoose.model('Room', roomSchema);

app.get('/api/rooms', async (req, res) => {
  const rooms = await Room.find();

  // Görsel URL'lerini tam hale getir
  const updatedRooms = rooms.map(room => ({
    ...room.toObject(),
    images: room.images.map(img => `${req.protocol}://${req.get('host')}/uploads/${img}`)
  }));

  res.json(updatedRooms);
});

app.post('/api/rooms', async (req, res) => {
  const newRoom = new Room(req.body);
  await newRoom.save();
  res.json({ message: 'Oda kaydedildi' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
