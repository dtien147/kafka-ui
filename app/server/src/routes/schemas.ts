import express from 'express';
import axios from 'axios';
import avro from 'avsc';

const router = express.Router();

const schemaRegistryUrl =
  process.env.SCHEMA_REGISTRY_URL || 'http://localhost:8081';

router.get('/', async (_, res) => {
  try {
    const result = await axios.get(`${schemaRegistryUrl}/subjects`);
    res.json(result.data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:subject', async (req, res) => {
  const { subject } = req.params;

  try {
    const response = await axios.get(
      `${schemaRegistryUrl}/subjects/${subject}/versions/latest`,
    );
    res.json({
      id: response.data.id,
      schema: JSON.parse(response.data.schema),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/sample/:subject', async (req, res) => {
  const { subject } = req.params;
  try {
    const schemaResponse = await axios.get(
      `${schemaRegistryUrl}/subjects/${subject}/versions/latest`,
    );

    let schema = schemaResponse.data.schema;
    schema = 
      typeof schema === 'string'
        ? JSON.parse(schema)
        : schema;

    const type = avro.Type.forSchema(schema);
    const sample = type.random();

    res.json({ sample });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
