import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_HOST } from '../constants';

interface TopicInfo {
  name: string;
  count: number | null;
}

type SortBy = 'name' | 'count';
type SortOrder = 'asc' | 'desc';

export default function Topics() {
  const [topics, setTopics] = useState<TopicInfo[]>([]);
  const [filtered, setFiltered] = useState<TopicInfo[]>([]);
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  useEffect(() => {
    const fetchTopics = async () => {
      const res = await axios.get<string[]>(`${API_HOST}/topics`);
      const list = res.data.map((topic: any) => ({ name: topic.name, count: topic.messageCount }));
      setTopics(list);
    };

    fetchTopics();
  }, []);

  // Filter + sort effect
  useEffect(() => {
    let result = topics.filter((t) =>
      t.name.toLowerCase().includes(filter.toLowerCase()),
    );

    result.sort((a, b) => {
      const dir = sortOrder === 'asc' ? 1 : -1;
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name) * dir;
      } else {
        const ac = a.count ?? 0;
        const bc = b.count ?? 0;
        return (ac - bc) * dir;
      }
    });

    setFiltered(result);
  }, [filter, sortBy, sortOrder, topics]);

  const toggleSort = (field: SortBy) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Kafka Topics</h2>

      <input
        className="border px-3 py-2 rounded w-full mb-4"
        placeholder="Filter by topic name..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

      <table className="w-full border text-left bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-100 cursor-pointer">
            <th className="p-2" onClick={() => toggleSort('name')}>
              Topic {sortBy === 'name' && (sortOrder === 'asc' ? '▲' : '▼')}
            </th>
            <th className="p-2" onClick={() => toggleSort('count')}>
              Messages {sortBy === 'count' && (sortOrder === 'asc' ? '▲' : '▼')}
            </th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((t) => (
            <tr key={t.name} className="border-t hover:bg-gray-50">
              <td className="p-2">
                <Link
                  to={`/topic/${t.name}`}
                  className="text-blue-600 hover:underline"
                >
                  {t.name}
                </Link>
              </td>
              <td className="p-2">
                {t.count === null ? '...' : t.count >= 0 ? t.count : 'Error'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
