import React, { useEffect, useState } from 'react';
import axios from 'axios';
import FilterSelect from '../components/FilterSelect';
import { API_HOST } from '../constants';

export default function AvroProducer() {
  const [topics, setTopics] = useState<string[]>([]);
  const [topic, setTopic] = useState('');

  const [keySchemas, setKeySchemas] = useState<string[]>([]);
  const [valueSchemas, setValueSchemas] = useState<string[]>([]);
  const [selectedKeySchema, setSelectedKeySchema] = useState('');
  const [selectedValueSchema, setSelectedValueSchema] = useState('');
  const [keySchemaText, setKeySchemaText] = useState('');
  const [valueSchemaText, setValueSchemaText] = useState('');
  const [key, setKey] = useState('{}');
  const [value, setValue] = useState('{}');

  const [useJson, setUseJson] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );
  const [status, setStatus] = useState('');

  useEffect(() => {
    axios.get(`${API_HOST}/avro/files`).then((res) => {
      const entries = Object.entries(res.data);
      setKeySchemas(entries.filter(([_, type]) => type === 'key').map(([name]) => name));
      setValueSchemas(entries.filter(([_, type]) => type === 'value').map(([name]) => name));
    });
    axios.get(`${API_HOST}/topics`).then((res) => setTopics(res.data));
  }, []);

  const loadSchema = async (file: string, type: 'key' | 'value') => {
    const res = await axios.get(`http://localhost:5000/avro/fields/${file}`);
    const schema = res.data.schema;
    const sampleRes = await axios.get(`http://localhost:5000/avro/load/${file}`);
    const sample = sampleRes.data.sample;

    const schemaText = JSON.stringify(schema, null, 2);
    const sampleText = JSON.stringify(sample, null, 2);

    if (type === 'key') {
      setKeySchemaText(schemaText);
      setKey(sampleText);
    } else {
      setValueSchemaText(schemaText);
      setValue(sampleText);
    }
  };

  const validateAvro = async (schemaText: string, json: string): Promise<boolean> => {
    try {
      const res = await axios.post(`${API_HOST}/avro/validate`, {
        schema: JSON.parse(schemaText),
        value: JSON.parse(json),
      });
      return res.data.valid === true;
    } catch (err: any) {
      setStatus(`❌ Validation failed: ${err.response?.data?.error || err.message}`);
      return false;
    }
  };

  const sendMessage = async () => {
    try {
      if (!useJson) {
        const validKey = await validateAvro(keySchemaText, key);
        const validValue = await validateAvro(valueSchemaText, value);
        if (!validKey || !validValue) return;
      }

      await axios.post(`http://localhost:5000/topics/${topic}/messages`, {
        key: JSON.parse(key),
        value: JSON.parse(value),
        useAvro: !useJson,
        keyAvroSchema: JSON.parse(keySchemaText),
        avroSchema: JSON.parse(valueSchemaText),
      });

      setStatus('✅ Message sent!');
    } catch (err: any) {
      setStatus(`❌ ${err.message}`);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl p-4 space-y-6">
      <h2 className="text-2xl font-bold">Send Kafka Message</h2>

      <FilterSelect
        label="Kafka Topic"
        options={topics}
        selected={topic}
        onSelect={setTopic}
        placeholder="Search topics..."
      />

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={useJson} onChange={() => setUseJson(!useJson)} />
          Use JSON instead of Avro
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={theme === 'dark'}
            onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          />
          Dark Theme
        </label>
      </div>

      {!useJson && (
        <>
          <FilterSelect
            label="Key Schema"
            options={keySchemas}
            selected={selectedKeySchema}
            onSelect={(val) => {
              setSelectedKeySchema(val);
              loadSchema(val, 'key');
            }}
            placeholder="Search key schemas..."
          />

          <FilterSelect
            label="Value Schema"
            options={valueSchemas}
            selected={selectedValueSchema}
            onSelect={(val) => {
              setSelectedValueSchema(val);
              loadSchema(val, 'value');
            }}
            placeholder="Search value schemas..."
          />
        </>
      )}

      <div>
        <h4 className="font-semibold mt-4">🔑 Key JSON</h4>
        <textarea
          className="w-full border p-2 rounded text-sm font-mono"
          rows={6}
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Paste or type key JSON here..."
        />
      </div>

      <div>
        <h4 className="font-semibold mt-4">📦 Value JSON</h4>
        <textarea
          className="w-full border p-2 rounded text-sm font-mono"
          rows={8}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Paste or type value JSON here..."
        />
      </div>

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-6"
        onClick={sendMessage}
      >
        Send Message
      </button>

      {status && <p className="text-sm mt-2 text-gray-600">{status}</p>}
    </div>
  );
}
