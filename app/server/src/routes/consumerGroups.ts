import express from 'express';
import { admin } from '../kafka';

const router = express.Router();

router.get('/', async (_, res) => {
  const groups = await admin.listGroups();
  const details = await Promise.all(
    groups.groups.map(async g => {
      const info = await admin.describeGroups([g.groupId]);
      return info.groups[0];
    })
  );
  res.json(details);
});

export default router;
