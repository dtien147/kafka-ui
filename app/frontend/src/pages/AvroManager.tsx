import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_HOST } from '../constants';

export default function AvroManager() {
  const [files, setFiles] = useState<Record<string, 'key' | 'value'>>({});
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [schemaType, setSchemaType] = useState<'key' | 'value'>('key');
  const [search, setSearch] = useState('');

  const fetchFiles = async () => {
    const res = await axios.get(`${API_HOST}/avro/files`);
    setFiles(res.data);
  };

  useEffect(() => { fetchFiles(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', schemaType);

    setUploading(true);
    setError('');

    try {
      await axios.post(`${API_HOST}/avro/upload`, formData);
      fetchFiles();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (file: string) => {
    try {
      await axios.delete(`http://localhost:5000/avro/${file}`);
      fetchFiles();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Delete failed');
    }
  };

  const sortedEntries = Object.entries(files)
    .filter(([filename]) => filename.toLowerCase().includes(search.toLowerCase()))
    .sort(([aName], [bName]) => aName.localeCompare(bName));

  return (
    <div className="container mx-auto p-4 max-w-3xl space-y-4">
      <h2 className="text-2xl font-bold">Manage Avro Schemas</h2>

      <div className="flex items-center gap-4">
        <select
          value={schemaType}
          onChange={(e) => setSchemaType(e.target.value as 'key' | 'value')}
          className="border rounded px-2 py-1"
        >
          <option value="key">🔑 Key Schema</option>
          <option value="value">📦 Value Schema</option>
        </select>

        <input type="file" accept=".avsc" onChange={handleUpload} />
      </div>

      {uploading && <p>Uploading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <input
        type="text"
        placeholder="🔍 Search schemas..."
        className="w-full border p-2 rounded"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <ul className="bg-white shadow rounded p-4 space-y-2">
        {sortedEntries.map(([file, type]) => (
          <li key={file} className="flex justify-between items-center text-sm">
            <span className="text-blue-800">
              {file} <span className="text-gray-400">({type})</span>
            </span>
            <button
              className="text-red-600 hover:underline text-xs"
              onClick={() => handleDelete(file)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
