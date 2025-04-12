import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_HOST } from '../constants';
import { Link } from 'react-router-dom';

interface TopicInfo {
  name: string;
  count: number | null;
}

export default function Topics() {
  const [topics, setTopics] = useState<TopicInfo[]>([]);

  useEffect(() => {
    const fetchTopics = async () => {
      const res = await axios.get<string[]>(`${API_HOST}/topics`);
      const topicList = res.data.map((topic: any) => ({
        name: topic.name,
        count: topic.messageCount,
      }));
      setTopics(topicList);
    };

    fetchTopics();
  }, []);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Kafka Topics</h2>
      <table className="w-full border text-left bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Topic</th>
            <th className="p-2">Messages</th>
          </tr>
        </thead>
        <tbody>
          {topics.map((t) => (
            <tr key={t.name} className="border-t">
              <td className="p-2">
                {' '}
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
