import { useEffect, useState, Fragment } from 'react';
import axios from 'axios';
import { Dialog, Transition } from '@headlessui/react';
import { API_HOST } from '../constants';

export default function Schemas() {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [selectedSchema, setSelectedSchema] = useState<{ subject: string; schema: any } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    axios.get(`${API_HOST}/schemas`).then((res) => setSubjects(res.data));
  }, []);

  const viewSchema = async (subject: string) => {
    const res = await axios.get(`${API_HOST}/schemas/${subject}`);
    setSelectedSchema({ subject, schema: res.data.schema });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedSchema(null);
  };

  const filteredSubjects = subjects.filter((s) =>
    s.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Schemas</h2>

      <input
        type="text"
        className="border p-2 rounded w-full mb-4"
        placeholder="🔍 Search subjects..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <ul className="space-y-2">
        {filteredSubjects.length === 0 ? (
          <li className="text-gray-500">No matching schemas found.</li>
        ) : (
          filteredSubjects.map((s) => (
            <li key={s} className="flex justify-between bg-white p-2 shadow rounded">
              <span>{s}</span>
              <button className="text-blue-600 hover:underline" onClick={() => viewSchema(s)}>
                View
              </button>
            </li>
          ))
        )}
      </ul>

      <Transition appear show={modalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-full p-4">
              <Dialog.Panel className="bg-white p-6 rounded max-w-3xl w-full shadow-xl">
                <Dialog.Title className="text-lg font-semibold mb-4">
                  📄 Schema: {selectedSchema?.subject}
                </Dialog.Title>

                <pre className="text-xs bg-gray-100 p-4 rounded overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(selectedSchema?.schema, null, 2)}
                </pre>

                <div className="text-right mt-4">
                  <button
                    onClick={closeModal}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
