import { v4 } from 'uuid';
import { IGNORE_TOPICS } from './constants';
import { admin, kafka } from './kafka';
import registry from './schema';

const GROUP_ID = 'kafka-ui-group-' + v4();

const consumers: any = [];
const consumerTopics: string[] = [];
const topicMessages: any = {};

let fromBeginning = false;

const registerConsumer = async (topics: string[]) => {
  if (topics.length === 0) {
    return;
  }
  const groupId = `${GROUP_ID}_${consumers.length}`;
  const consumer = kafka.consumer({
    groupId,
  });
  await consumer.connect();

  consumers.push(consumer);

  await consumer.subscribe({ topics, fromBeginning });
  console.log(`SUBSCRIBED TOPICS=${topics} for GROUP=${groupId}`);

  topics.forEach((topic) => {
    consumerTopics.push(topic);
    topicMessages[topic] = [];
  });

  await consumer.run({
    eachMessage: async ({ topic, message, partition }) => {
      if (message === null || message.value === null || message.key === null) {
        console.log(`RECEIVE MESSAGE FROM TOPIC=${topic} with null value or null key`);
        return;
      }

      let decodedValue;
      let decodedKey;
      try {
        decodedValue = await registry.decode(message.value);
        decodedKey = await registry.decode(message.key);
      } catch (error: any) {
        console.log('DECODE ERROR', error);
        decodedValue = message.value?.toString();
        decodedKey = message.key?.toString();
      }

      console.log(`RECEIVE MESSAGE FROM TOPIC=${topic} with key=${JSON.stringify(decodedKey)} and value=${JSON.stringify(decodedValue)}`);

      topicMessages[topic].push({
        key: decodedKey,
        value: decodedValue,
        offset: message.offset,
        partition,
      });
    },
  });
};

export const registerAllConsumers = async () => {
  const topics = await admin.listTopics();

  registerConsumer(
    topics
      .filter((topic) => !IGNORE_TOPICS.includes(topic))
      .filter((topic) => !consumerTopics.includes(topic)),
  );
};

export const getAllConsumers = () => consumers;

export const getConsumerMessages = (topic: any) => topicMessages[topic] || [];

export const getConsumerTopics = () => consumerTopics;

export const setLoadAllMessages = () => (fromBeginning = true);
