import React, { useMemo, useState } from 'react';

const MAX_LENGTH = 300;

export default function Message({ message }: { message: any }) {
  const [expanded, setExpanded] = useState(false);

  const messageRawData = useMemo(
    () => JSON.stringify(message.value, null, 2),
    [message.offset],
  );
  const length = messageRawData.length;

  const renderValue = () => {
    if (length < MAX_LENGTH) {
      return (
        <pre className="whitespace-pre-wrap break-words">{messageRawData}</pre>
      );
    }

    return (
      <pre className="text-sm overflow-x-auto whitespace-pre-wrap break-words">
        {expanded
          ? messageRawData
          : messageRawData.slice(0, MAX_LENGTH) + '...'}
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-blue-600 ml-2 underline"
        >
          {expanded ? 'Collapse' : 'Expand'}
        </button>
      </pre>
    );
  };

  return (
    <div className="bg-white shadow rounded p-4 border border-gray-200">
      <div className="text-sm text-gray-500 mb-1">
        <span className="font-medium">Partition:</span> {message.partition} |
        <span className="font-medium ml-2">Offset:</span> {message.offset}
      </div>

      <div className="text-sm text-blue-700 mb-2">
        <span className="font-semibold">Key:</span> {JSON.stringify(message.key)}
      </div>
      <div className="bg-gray-100 text-sm rounded p-2 overflow-x-auto">
        {renderValue()}
      </div>
    </div>
  );
}
