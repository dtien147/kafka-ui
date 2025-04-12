# Kafka UI

A React + Node.js based Kafka UI to monitor, produce, and decode messages. Supports:

- KafkaJS + Schema Registry
- Avro encode/decode
- Topic message browsing
- Schema viewing
- Consumer group lag
- Avro schema builder

## 🧱 Project Structure

- `frontend/`: React app
- `backend/`: Node.js server with KafkaJS
- `packages/types/`: Shared TypeScript interfaces

## 🚀 Getting Started

```bash
yarn install
yarn workspace server dev
yarn workspace frontend start
```

## 🐳 Docker

```bash
docker-compose up
```
