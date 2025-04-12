import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import topicRoutes from './routes/topics';
import schemaRoutes from './routes/schemas';
import groupRoutes from './routes/consumerGroups';
import metricsRoutes from './routes/metrics';

import { admin, producer } from './kafka';
import { registerAllConsumers, setLoadAllMessages } from './consumers';
import avroRoutes from './routes/avro';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/topics', topicRoutes);
app.use('/api/schemas', schemaRoutes);
app.use('/api/consumer-groups', groupRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/avro', avroRoutes);

export const loadKafka = async () => {
    await admin.connect();
    await producer.connect();
  
    await registerAllConsumers();
  
    setInterval(() => {
      setLoadAllMessages();
      registerAllConsumers();
    }, 2000);
}

process.on('exit', async function() {
  await producer.disconnect();
  await admin.disconnect();
});

export default app;
