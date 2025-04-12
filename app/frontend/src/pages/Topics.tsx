import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_HOST } from '../constants';

export default function Topics() {
  const [topics, setTopics] = useState<string[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    axios.get(`${API_HOST}/topics`).then(res => setTopics(res.data));
  }, []);

  const filtered = topics.filter(t => t.includes(filter));

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Kafka Topics</h2>
      <input
        className="border border-gray-300 rounded px-2 py-1 mb-4 w-full"
        placeholder="Search topics..."
        onChange={e => setFilter(e.target.value)}
      />
      <ul className="space-y-2">
        {filtered.map(t => (
          <li key={t} className="p-2 bg-white shadow rounded hover:bg-gray-100">
            <Link to={`/topic/${t}`} className="text-blue-600 hover:underline">{t}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}