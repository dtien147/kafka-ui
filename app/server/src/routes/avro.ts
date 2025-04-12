import express from 'express';
import avro from 'avsc';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import os from 'os';

const FOLDER_PATH = `${os.homedir()}/avro`;
const INDEX_PATH = `${FOLDER_PATH}/index.json`;

const upload = multer({ dest: './tmp' });
const router = express.Router();

router.post('/sample', async (req, res) => {
  try {
    const schema =
      typeof req.body.schema === 'string'
        ? JSON.parse(req.body.schema)
        : req.body.schema;

    const type = avro.Type.forSchema(schema);
    const sample = type.random();

    res.json({ sample });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/files', async (_, res) => {
  const index = fs.existsSync(INDEX_PATH)
    ? JSON.parse(fs.readFileSync(INDEX_PATH, 'utf-8'))
    : {};
  res.json(index);
});

router.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  const type = req.body.type; // 'key' or 'value'

  if (!file || !type) {
    res.status(400).json({ error: 'Missing file or type' });
    return;
  }

  const targetDir = path.join(FOLDER_PATH);
  const targetPath = path.join(targetDir, file.originalname);

  try {
    const schemaText = fs.readFileSync(file.path, 'utf-8');
    const parsed = JSON.parse(schemaText);
    avro.Type.forSchema(parsed); // validate

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(file.path);
      res.status(400).json({ error: 'File already exists' });
      return;
    }

    fs.copyFileSync(file.path, targetPath);
    fs.unlinkSync(file.path); // remove temp file

    const indexPath = path.join(targetDir, 'index.json');
    const index = fs.existsSync(indexPath)
      ? JSON.parse(fs.readFileSync(indexPath, 'utf-8'))
      : {};
    index[file.originalname] = type;
    fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));

    res.json({ message: 'Uploaded and saved to home folder' });
  } catch (err: any) {
    fs.unlinkSync(file.path);
    res.status(400).json({ error: 'Invalid schema: ' + err.message });
  }
});

router.get('/load/:filename', (req, res) => {
  const filePath = `${FOLDER_PATH}/${req.params.filename}`;
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const schema = JSON.parse(raw);
    const type = avro.Type.forSchema(schema);
    const sample = type.random();
    res.json({ schema, sample });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post('/validate', (req, res) => {
  const { schema, value } = req.body;

  try {
    const type = avro.Type.forSchema(schema);
    const valid = type.isValid(value, { errorHook: (e) => console.error(e) });

    if (!valid) {
      res.status(400).json({ error: 'Value does not match schema' });
      return;
    }

    res.json({ valid: true });
  } catch (err: any) {
    res.status(400).json({ error: 'Invalid schema or value: ' + err.message });
  }
});

router.get('/fields/:filename', (req, res) => {
  const filePath = `${FOLDER_PATH}/${req.params.filename}`;
  try {
    const schema = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    res.json({
      schema,
      fields: schema.fields || [],
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:filename', (req, res) => {
  const file = req.params.filename;
  const filePath = path.resolve(FOLDER_PATH, file);

  if (!file.endsWith('.avsc')) {
    res.status(400).json({ error: 'Only .avsc files can be deleted' });
    return;
  }

  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: 'File not found' });
    return;
  }

  fs.unlinkSync(filePath);

  const index = fs.existsSync(INDEX_PATH)
    ? JSON.parse(fs.readFileSync(INDEX_PATH, 'utf-8'))
    : {};
  delete index[file];
  fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2));

  res.json({ message: `Deleted ${file} and updated index.json` });
});

export default router;
