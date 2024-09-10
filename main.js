import express from 'express';

const app = express();
const port = 3921;

app.use(express.static('public'));

// we have to do this on the backend because the browser throws a CORS error if it tries to access this API
app.get('/qrng', async (req, res) => {
  const response = await fetch('http://lfdr.de/qrng_api/qrng?length=1&format=HEX');
  const data = await response.json();
  res.json(data);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
