import React from 'react';

type ConnectionStatusProps = {
  status: 'connecting' | 'connected' | 'disconnected';
};

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ status }) => (
  <div className={`
    fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-20
    ${status === 'connected' ? 'bg-green-500' : 
      status === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'}
    text-white
  `}>
    {status === 'connected' ? 'Connected' :
     status === 'connecting' ? 'Connecting...' : 'Disconnected'}
  </div>
);