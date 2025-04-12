import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_HOST } from '../constants';

type SchemaType = 'key' | 'value';

interface PendingFile {
  file: File;
  name: string;
  type: SchemaType | '';
  error?: string;
}

export default function AvroManager() {
  const [files, setFiles] = useState<Record<string, SchemaType>>({});
  const [pending, setPending] = useState<PendingFile[]>([]);
  const [suffixHint, setSuffixHint] = useState<string>('key.avsc');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    const res = await axios.get(`${API_HOST}/avro/files`);
    setFiles(res.data);
  };

  const detectTypeFromHint = (fileName: string): SchemaType | '' => {
    if (fileName.toLowerCase().endsWith(suffixHint)) return 'key';
    return 'value';
  };

  const handleFileInput = (fileList: FileList | null) => {
    if (!fileList) return;

    const newFiles: PendingFile[] = Array.from(fileList).map((file) => ({
      file,
      name: file.name,
      type: detectTypeFromHint(file.name),
    }));

    setPending((prev) => [...prev, ...newFiles]);
  };

  const uploadAll = async () => {
    const uploads = pending.map(async (item) => {
      if (!item.type) {
        item.error = 'Missing or invalid type';
        return item;
      }

      const form = new FormData();
      form.append('file', item.file); // Keep original name
      form.append('type', item.type);

      try {
        await axios.post(`${API_HOST}/avro/upload`, form);
        return null;
      } catch (err: any) {
        item.error = err.response?.data?.error || err.message;
        return item;
      }
    });

    const results = await Promise.all(uploads);
    const failed = results.filter(Boolean) as PendingFile[];
    setPending(failed);
    await fetchList();
    setError(failed.length > 0 ? 'Some uploads failed' : '');
  };

  const removePending = (index: number) => {
    setPending((prev) => prev.filter((_, i) => i !== index));
  };

  const removeUploaded = async (file: string) => {
    await axios.delete(`${API_HOST}/avro/${file}`);
    await fetchList();
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Manage Avro Files</h2>

      <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium">Suffix for key schema file</label>
          <input
            className="border rounded px-2 py-1 w-40"
            value={suffixHint}
            onChange={(e) => setSuffixHint(e.target.value)}
            placeholder=".key.avsc"
            disabled
            readOnly
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium">Select files</label>
          <input
            type="file"
            accept=".avsc"
            multiple
            onChange={(e) => handleFileInput(e.target.files)}
          />
        </div>

        {pending.length > 0 && (
          <button
            onClick={uploadAll}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Upload All
          </button>
        )}
      </div>

      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      {pending.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Pending Uploads</h3>
          <table className="w-full border text-left bg-white shadow rounded">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">Filename</th>
                <th className="p-2">Detected Type</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {pending.map((p, i) => (
                <tr key={p.name + i} className="border-t">
                  <td className="p-2">{p.name}</td>
                  <td className="p-2 capitalize">
                    {p.type || <span className="text-red-600">Unknown</span>}
                    {p.error && (
                      <div className="text-sm text-red-500">{p.error}</div>
                    )}
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => removePending(i)}
                      className="text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Uploaded Files */}
      <table className="w-full border text-left bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">File</th>
            <th className="p-2">Type</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(files).map(([name, type]) => (
            <tr key={name} className="border-t">
              <td className="p-2">{name}</td>
              <td className="p-2 capitalize">{type}</td>
              <td className="p-2">
                <button
                  onClick={() => removeUploaded(name)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
