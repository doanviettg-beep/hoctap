import React from 'react';
import { GraduationCap } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-blue-700 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 flex items-center">
        <div className="bg-white p-2 rounded-full text-blue-700 mr-4 shadow-sm">
           <GraduationCap size={40} />
        </div>
        <div>
          <h2 className="text-sm font-light uppercase tracking-wide opacity-90">UBND Xã Chiềng Sinh</h2>
          <h1 className="text-2xl font-bold uppercase tracking-tight">Trường TH&THCS Nà Sáy</h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
