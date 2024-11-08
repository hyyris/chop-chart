import express from 'express';
import cors from 'cors';

const app = express();
const port = 3001;

app.use(cors());

let dummyData = {
  Preproduction: { message: 'Preproduction event data', timestamp: new Date().toLocaleTimeString() },
  Storage: { message: 'Storage event data', timestamp: new Date().toLocaleTimeString() },
  Packing: { message: 'Packing event data', timestamp: new Date().toLocaleTimeString() },
};

const updateDummyData = () => {
  dummyData = {
    Preproduction: { message: `Preproduction event data ${Math.random()}`, timestamp: new Date().toLocaleTimeString() },
    Storage: { message: `Storage event data ${Math.random()}`, timestamp: new Date().toLocaleTimeString() },
    Packing: { message: `Packing event data ${Math.random()}`, timestamp: new Date().toLocaleTimeString() },
  };
};

setInterval(updateDummyData, 3000);

app.get('/api/:tab', (req, res) => {
  const tab = req.params.tab;
  res.json(dummyData[tab] || { message: 'No data available' });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});