import React, { ReactNode } from 'react';

interface CenteredLayoutProps {
    children: ReactNode;
}

const CenteredLayout:React.FC<CenteredLayoutProps> = ({ children }) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="max-w-lg w-full p-4">
        {children}
      </div>
    </div>
  );
};

export default CenteredLayout;
