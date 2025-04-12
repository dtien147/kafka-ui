import app, { loadKafka } from './server';

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  await loadKafka();
  console.log('Backend running on port 5000');
});
