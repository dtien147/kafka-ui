import { kafka } from '../kafka';
import registry from '../schema';

const topic = 'users';

const run = async () => {
  const consumer = kafka.consumer({ groupId: 'test-group' });
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      if (message === null || message.value === null) {
        return;
      }

      try {
        const decoded = await registry.decode(message.value);
        console.log(`[${partition}] ${message.offset} -`, decoded);
      } catch (err) {
        console.error(`❌ Failed to decode: ${err}`);
      }
    },
  });
};

run().catch(console.error);
