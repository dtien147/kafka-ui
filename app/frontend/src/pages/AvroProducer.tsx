import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_HOST } from '../constants';

type SchemaSource = 'registry' | 'file' | 'manual';

export default function AvroProducer() {
  const [topics, setTopics] = useState<string[]>([]);
  const [topic, setTopic] = useState('');
  const [topicFilter, setTopicFilter] = useState('');

  const [schemas, setSchemas] = useState<string[]>([]);
  const [files, setFiles] = useState<string[]>([]);

  const [keySource, setKeySource] = useState<SchemaSource>('registry');
  const [keySchema, setKeySchema] = useState('');
  const [keySchemaText, setKeySchemaText] = useState('{}');
  const [keyFilter, setKeyFilter] = useState('');

  const [valueSource, setValueSource] = useState<SchemaSource>('registry');
  const [valueSchema, setValueSchema] = useState('');
  const [valueSchemaText, setValueSchemaText] = useState('{}');
  const [valueFilter, setValueFilter] = useState('');

  const [key, setKey] = useState('{}');
  const [value, setValue] = useState('{}');
  const [status, setStatus] = useState('');

  useEffect(() => {
    axios.get(`${API_HOST}/topics`).then(res =>
      setTopics(res.data.map((t: any) => t.name))
    );
    axios.get(`${API_HOST}/schemas`).then(res => setSchemas(res.data));
    axios.get(`${API_HOST}/avro/files`).then(res =>
      setFiles(Object.keys(res.data))
    );
  }, []);

  const filteredTopics = topics.filter(t =>
    t.toLowerCase().includes(topicFilter.toLowerCase())
  );

  const filteredKeyOptions =
    keySource === 'registry'
      ? schemas.filter(s => s.toLowerCase().endsWith('key') && s.toLowerCase().includes(keyFilter.toLowerCase()))
      : files.filter(f => f.toLowerCase().endsWith('key.avsc') && f.toLowerCase().includes(keyFilter.toLowerCase()));

  const filteredValueOptions =
    valueSource === 'registry'
      ? schemas.filter(s => !s.toLowerCase().endsWith('key') && s.toLowerCase().includes(valueFilter.toLowerCase()))
      : files.filter(f => !f.toLowerCase().endsWith('key.avsc') && f.toLowerCase().includes(valueFilter.toLowerCase()));

  const loadSchema = async (source: SchemaSource, name: string, type: 'key' | 'value') => {
    if (source === 'registry') {
      const res = await axios.get(`${API_HOST}/schemas/${name}`);
      const sampleRes = await axios.get(`${API_HOST}/schemas/sample/${name}`);
      const schemaText = JSON.stringify(res.data.schema, null, 2);
      const sample = JSON.stringify(sampleRes.data.sample, null, 2);
    
      if (type === 'key') {
        setKeySchemaText(schemaText);
        setKey(sample);
      } else {
        setValueSchemaText(schemaText);
        setValue(sample);
      }
    } else if (source === 'file') {
      const schemaRes = await axios.get(`${API_HOST}/avro/fields/${name}`);
      const sampleRes = await axios.get(`${API_HOST}/avro/load/${name}`);
      const schema = JSON.stringify(schemaRes.data.schema, null, 2);
      const sample = JSON.stringify(sampleRes.data.sample, null, 2);
      if (type === 'key') {
        setKeySchemaText(schema);
        setKey(sample);
      } else {
        setValueSchemaText(schema);
        setValue(sample);
      }
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
    const validKey = await validateAvro(keySchemaText, key);
    const validValue = await validateAvro(valueSchemaText, value);
    if (!validKey || !validValue) return;

    try {
      await axios.post(`${API_HOST}/topics/${topic}/messages`, {
        topic,
        key: JSON.parse(key),
        value: JSON.parse(value),
        useAvro: true,
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

      {/* Topic Input */}
      <div className="relative">
        <input
          className="w-full border p-2 rounded"
          placeholder="Kafka Topic"
          value={topic}
          onChange={(e) => {
            setTopic(e.target.value);
            setTopicFilter(e.target.value);
          }}
        />
        {topicFilter && filteredTopics.length > 0 && (
          <ul className="absolute z-10 w-full bg-white border rounded shadow mt-1 max-h-40 overflow-auto">
            {filteredTopics.map(t => (
              <li
                key={t}
                className="px-3 py-1 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setTopic(t);
                  setTopicFilter('');
                }}
              >
                {t}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Key Schema */}
      <div>
        <label className="block font-semibold mt-4">Key Schema Source</label>
        <select
          className="border p-2 rounded w-full mb-2"
          value={keySource}
          onChange={(e) => setKeySource(e.target.value as SchemaSource)}
        >
          <option value="registry">Schema Registry</option>
          <option value="file">AVSC File</option>
          <option value="manual">Manual JSON</option>
        </select>

        {keySource !== 'manual' && (
          <div className="relative">
            <input
              className="w-full border p-2 rounded"
              placeholder="Select or type schema name"
              value={keySchema}
              onChange={(e) => {
                setKeySchema(e.target.value);
                setKeyFilter(e.target.value);
              }}
            />
            {keyFilter && filteredKeyOptions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border rounded shadow mt-1 max-h-40 overflow-auto">
                {filteredKeyOptions.map(s => (
                  <li
                    key={s}
                    className="px-3 py-1 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setKeySchema(s);
                      setKeyFilter('');
                      loadSchema(keySource, s, 'key');
                    }}
                  >
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <textarea
          className="w-full border p-2 mt-2 rounded text-sm font-mono"
          rows={6}
          value={keySchemaText}
          onChange={(e) => setKeySchemaText(e.target.value)}
          disabled={keySource !== 'manual'}
          placeholder="Key schema JSON"
        />
      </div>

      <h4 className="font-semibold mt-4">🔑 Key JSON</h4>
      <textarea
        className="w-full border p-2 rounded text-sm font-mono"
        rows={6}
        value={key}
        onChange={(e) => setKey(e.target.value)}
        placeholder="Paste or type key JSON here..."
      />

      {/* Value Schema */}
      <div>
        <label className="block font-semibold mt-6">Value Schema Source</label>
        <select
          className="border p-2 rounded w-full mb-2"
          value={valueSource}
          onChange={(e) => setValueSource(e.target.value as SchemaSource)}
        >
          <option value="registry">Schema Registry</option>
          <option value="file">AVSC File</option>
          <option value="manual">Manual JSON</option>
        </select>

        {valueSource !== 'manual' && (
          <div className="relative">
            <input
              className="w-full border p-2 rounded"
              placeholder="Select or type schema name"
              value={valueSchema}
              onChange={(e) => {
                setValueSchema(e.target.value);
                setValueFilter(e.target.value);
              }}
            />
            {valueFilter && filteredValueOptions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border rounded shadow mt-1 max-h-40 overflow-auto">
                {filteredValueOptions.map(s => (
                  <li
                    key={s}
                    className="px-3 py-1 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setValueSchema(s);
                      setValueFilter('');
                      loadSchema(valueSource, s, 'value');
                    }}
                  >
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <textarea
          className="w-full border p-2 mt-2 rounded text-sm font-mono"
          rows={6}
          value={valueSchemaText}
          onChange={(e) => setValueSchemaText(e.target.value)}
          disabled={valueSource !== 'manual'}
          placeholder="Value schema JSON"
        />
      </div>

      <h4 className="font-semibold mt-4">📦 Value JSON</h4>
      <textarea
        className="w-full border p-2 rounded text-sm font-mono"
        rows={8}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Paste or type value JSON here..."
      />

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-6 disabled:bg-gray-300 disabled:cursor-not-allowed"
        onClick={sendMessage}
        disabled={!topic}
      >
        Send Message
      </button>

      {status && <p className="text-sm mt-2 text-gray-600">{status}</p>}
    </div>
  );
}
