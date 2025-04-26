import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'src', 'web')));
app.get('/results', (req, res) => {
  res.sendFile(path.join(__dirname, 'results', 'results.json'));
});

app.get('/sequential', (req, res) => {
  res.sendFile(path.join(__dirname, 'results', 'sequential.json'));
});

app.get('/parallel', (req, res) => {
  res.sendFile(path.join(__dirname, 'results', 'parallel.json'));
});

app.listen(PORT, () => {
  console.log(`🌐 Server running at http://localhost:${PORT}`);
});
