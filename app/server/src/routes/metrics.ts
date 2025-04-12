import express from 'express';
import { admin } from '../kafka';

const router = express.Router();

// router.get('/:topic', async (req, res) => {
//   const { topic } = req.params;
//   const partitions = await admin.fetchTopicMetadata({ topics: [topic] });
//   const offsets = await admin.fetchTopicOffsets(topic);
//   res.json({
//     partitions: partitions.topics[0].partitions,
//     offsets
//   });
// });

// router.get('/lag/:groupId/:topic', async (req, res) => {
//   const { groupId, topic } = req.params;
//   const topicOffsets = await admin.fetchTopicOffsets(topic);
//   const consumerOffsets = await admin.fetchOffsets({ groupId, topic });

//   const lag = topicOffsets.map(partition => {
//     const consumer = consumerOffsets.find(p => p.partition === partition.partition);
//     return {
//       partition: partition.partition,
//       high: parseInt(partition.high),
//       consumer: consumer ? parseInt(consumer.offset) : 0,
//       lag: consumer ? parseInt(partition.high) - parseInt(consumer.offset) : parseInt(partition.high)
//     };
//   });

//   res.json(lag);
// });

export default router;
