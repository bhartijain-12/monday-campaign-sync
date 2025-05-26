const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/webhook', (req, res) => {
  console.log('Webhook received');
  res.sendStatus(200);
});

app.get('/', (req, res) => {
  res.send('Server is live.');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
