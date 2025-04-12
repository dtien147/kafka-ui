import React, { useState } from 'react';
import { Combobox } from '@headlessui/react';

interface FilterSelectProps {
  label: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  placeholder?: string;
}

export default function FilterSelect({
  label,
  options,
  selected,
  onSelect,
  placeholder = 'Search...',
}: FilterSelectProps) {
  const [query, setQuery] = useState('');

  const filtered =
    query === ''
      ? options
      : options.filter((item) =>
          item.toLowerCase().includes(query.toLowerCase())
        );

  return (
    <div className="mb-4">
      <label className="block font-semibold mb-1">{label}</label>
      <Combobox value={selected} onChange={onSelect}>
        <div className="relative">
          <Combobox.Input
            className="w-full border rounded p-2"
            placeholder={placeholder}
            onChange={(e) => setQuery(e.target.value)}
            displayValue={(val: string) => val}
          />
          <Combobox.Options className="absolute z-10 w-full bg-white shadow border mt-1 rounded max-h-60 overflow-auto text-sm">
            {filtered.length === 0 && (
              <div className="px-4 py-2 text-gray-400">No match found.</div>
            )}
            {filtered.map((item) => (
              <Combobox.Option
                key={item}
                value={item}
                className={({ active }) =>
                  `cursor-pointer px-4 py-2 ${active ? 'bg-blue-100' : ''}`
                }
              >
                {item}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        </div>
      </Combobox>
    </div>
  );
}
