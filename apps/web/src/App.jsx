import React from 'react';
import MembersPage from './pages/MembersPage';

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Simple navigation/header for now */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
              AM
            </div>
            <span className="font-bold text-slate-800 text-lg">AM-Fincorp</span>
          </div>
        </div>
      </nav>

      <main>
        <MembersPage />
      </main>
    </div>
  );
}

export default App;
