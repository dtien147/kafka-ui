import { SchemaType } from '@kafkajs/confluent-schema-registry';
import { faker } from '@faker-js/faker';
import { v4 } from 'uuid';
import { producer } from '../kafka';
import registry from '../schema';

const topic = 'user';
const schema = {
  type: 'record',
  name: 'User',
  namespace: 'com.test',
  fields: [
    { name: 'id', type: 'string' },
    { name: 'name', type: 'string' },
    { name: 'email', type: 'string' },
  ],
};

const keySchema = {
  "type": "record",
  "name": "UserKey",
  "namespace": "com.test",
  "fields": [
    { "name": "userId", "type": "string" }
  ]
};

export const produceSampleMessage = async () => {
  await producer.connect();

  const { id } = await registry.register({
    type: SchemaType.AVRO,
    schema: JSON.stringify(schema),
  });

  const { id: keySchemaId } = await registry.register({
    type: SchemaType.AVRO,
    schema: JSON.stringify(keySchema),
  });

  const messages = await Array.from({ length: 10 }).map(async () => {
    const user = {
      id: v4(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
    };
  
    return {
      key: await registry.encode(keySchemaId, { userId: user.id }),
      value: await registry.encode(id, user),
    };
  });

  const payloads = await Promise.all(messages);

  await producer.send({ topic, messages: payloads });
  console.log(`✅ Sent ${messages.length} messages to topic "${topic}"`);

  await producer.disconnect();
};

produceSampleMessage().catch(console.error);
