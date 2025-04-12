import express from 'express';
import { SchemaType } from '@kafkajs/confluent-schema-registry';
import registry from '../schema';
import { admin, producer } from '../kafka';
import { getConsumerMessages } from '../consumers';
import { IGNORE_TOPICS } from '../constants';

const router = express.Router();

router.get('/', async (_, res) => {
  const topics = await admin.listTopics();

  res.json(topics.filter((topic) => !IGNORE_TOPICS.includes(topic)));
});

router.get('/:topic/messages', async (req, res) => {
  const { topic } = req.params;
  const fromOffset = parseInt(req.query.offset as string) || 0;

  const messages = getConsumerMessages(topic);
  res.json({
    fromOffset,
    total: messages.length,
    messages: messages.filter(
      (message: any) => parseInt(message.offset) >= fromOffset,
    ),
  });
});

router.post('/:topic/messages', async (req, res) => {
  const { topic } = req.params;
  const { key, value, avroSchema, keyAvroSchema } = req.body;

  const { id: keyId } = keyAvroSchema
    ? await registry.register({
        type: SchemaType.AVRO,
        schema: JSON.stringify(keyAvroSchema),
      })
    : {};

  const { id: valueId } = await registry.register({
    type: SchemaType.AVRO,
    schema: JSON.stringify(avroSchema),
  });

  await producer.send({
    topic,
    messages: [
      {
        key: keyId ? await registry.encode(keyId, key) : key,
        value: await registry.encode(valueId, value),
      },
    ],
  });

  res.json({ status: 'sent' });
});

export default router;
