import axios from 'axios';
import { useEffect, useState } from 'react';
import { API_HOST } from '../constants';

export default function ConsumerGroups() {
  const [groups, setGroups] = useState<any[]>([]);

  useEffect(() => {
    axios
      .get(`${API_HOST}/consumer-groups`)
      .then((res) => setGroups(res.data));
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Consumer Groups</h2>
      <ul className="space-y-4">
        {groups.map((g) => (
          <li key={g.groupId} className="bg-white rounded shadow p-4">
            <div className="font-semibold">
              {g.groupId} —{' '}
              <span className="text-sm text-gray-500">{g.state}</span>
            </div>
            <ul className="ml-4 mt-2 list-disc text-sm">
              {g.members.map((m: any) => (
                <li key={m.memberId}>
                  {m.clientId} on {m.clientHost}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
