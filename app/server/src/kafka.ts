import { Kafka } from 'kafkajs';

export const kafka = new Kafka({
  clientId: 'kafka-ui',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
});

export const admin = kafka.admin();
export const producer = kafka.producer();
