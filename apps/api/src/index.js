const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'myri-api', ts: new Date().toISOString() });
});

const port = process.env.PORT || 4001;
app.listen(port, () => {
  console.log(`[myri-api] listening on http://localhost:${port}`);
});
