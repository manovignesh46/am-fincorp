import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Search, AlertCircle, Loader2 } from 'lucide-react';
import DataTable from '../components/ui/DataTable';

const MembersPage = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        // Assuming API endpoint is /api/members
        const response = await axios.get('/api/members');
        setMembers(response.data.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching members:', err);
        setError('Failed to load member directory. Please try again later.');
        // For demonstration purposes if API isn't up, setting some dummy data could be helpful
        // but as per strict rules we should handle real flow.
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Contact', accessor: 'contact' },
    { header: 'Email', accessor: (row) => row.email || '-' },
    { header: 'Address', accessor: (row) => row.address ? (
      <span className="truncate max-w-[200px] block">{row.address}</span>
    ) : '-' },
    {
      header: 'Actions',
      accessor: (row) => (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            console.log('Edit member', row.id);
          }}
          className="text-indigo-600 hover:text-indigo-900 font-medium"
        >
          View Details
        </button>
      )
    }
  ];

  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.contact.includes(searchTerm)
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Member Directory</h1>
          <p className="text-slate-500 mt-1">Manage and view all human participants in the system.</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
          <UserPlus size={18} />
          <span>Add Member</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex items-center gap-3">
        <Search className="text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Search members by name or contact..." 
          className="flex-1 outline-none text-slate-700 placeholder:text-slate-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Loader2 className="animate-spin mb-4" size={40} />
          <p>Loading member directory...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-red-500 bg-red-50 rounded-xl border border-red-100">
          <AlertCircle className="mb-4" size={40} />
          <p className="font-semibold">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 text-sm underline underline-offset-4 hover:text-red-700"
          >
            Try Again
          </button>
        </div>
      ) : (
        <DataTable columns={columns} data={filteredMembers} />
      )}
    </div>
  );
};

export default MembersPage;
