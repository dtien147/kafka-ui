import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';

const registry = new SchemaRegistry({
  host: process.env.SCHEMA_REGISTRY_URL || 'http://localhost:8081',
});

export default registry;
