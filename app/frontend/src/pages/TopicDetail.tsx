import { useEffect, useState } from 'react';
import axios from 'axios';
import Message from '../components/Message';
import { API_HOST } from '../constants';

export default function TopicDetail({ topic }: { topic: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [fromOffset, setFromOffset] = useState(0);
  const [filters, setFilters] = useState({ key: '', value: '', partition: '' });
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchMessages();
  }, [topic, fromOffset]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => fetchMessages(), 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchMessages = async () => {
    const res = await axios.get(
      `${API_HOST}/topics/${topic}/messages?offset=${fromOffset}&limit=${limit}`,
    );
    const { messages, total } = res.data;
    const filtered = messages.filter((msg: any) => {
      return (
        (!filters.key || msg.key?.includes(filters.key)) &&
        (!filters.value || JSON.stringify(msg.value).includes(filters.value)) &&
        (!filters.partition || msg.partition.toString() === filters.partition)
      );
    });
    setMessages(filtered);
    setFromOffset(Math.max(fromOffset, parseInt(messages[0].offset)));
    setTotal(total);
  };

  const nextPage = () => {
    setFromOffset(Math.max(fromOffset + limit, 0));
  };

  const prevPage = () => {
    setFromOffset(Math.max(fromOffset - limit, 0));
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">
        Topic: <span className="text-blue-600">{topic}</span>
      </h2>
      <h3 className="font-bold mb-4">
        Total messages: <span className="text-blue-600">{total}</span>
      </h3>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <h4 className="font-semibold mb-2">Filters</h4>
          <input
            className="border rounded w-full mb-2 p-2"
            placeholder="Key"
            onChange={(e) => setFilters({ ...filters, key: e.target.value })}
          />
          <input
            className="border rounded w-full mb-2 p-2"
            placeholder="Value"
            onChange={(e) => setFilters({ ...filters, value: e.target.value })}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <button className="bg-gray-200 px-3 py-1 rounded" onClick={prevPage}>
          Prev
        </button>

        <input
          type="number"                               
          step={limit}
          className="border rounded px-2 py-1 w-24"
          value={fromOffset}
          onChange={(e) => setFromOffset(parseInt(e.target.value))}
        />
        <button className="bg-gray-200 px-3 py-1 rounded" onClick={nextPage}>
          Next
        </button>
        <button
          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
          onClick={fetchMessages}
        >
          Load
        </button>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={() => setAutoRefresh(!autoRefresh)}
          />
          <span className="text-sm">Auto-refresh</span>
        </label>
      </div>

      <h4 className="font-semibold mb-2">Messages</h4>
      <div className="space-y-4">
        {messages.map((msg, idx) => <Message key={idx} message={msg} />)}
      </div>
    </div>
  );
}
