import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserPlus, Search, AlertCircle, Loader2, Edit2, Trash2 } from 'lucide-react';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import MemberForm from '../components/members/MemberForm';
import { Member } from '../types';
import { Column } from '../components/ui/DataTable';

interface MemberFormData {
  name: string;
  contact: string;
  email: string;
  address: string;
}
const MembersPage = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMembers = async (currentPage = page, currentLimit = limit, search = searchTerm) => {
    try {
      setLoading(true);
      const params: Record<string, unknown> = { page: currentPage, limit: currentLimit };
      if (search) params.search = search;
      const response = await axios.get<{ data: Member[]; total: number; page: number; limit: number }>('/members', { params });
      setMembers(response.data.data);
      setTotal(response.data.total);
      setError(null);
    } catch (err) {
      console.error('Error fetching members:', err);
      setError('Failed to load member directory. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers(page, limit, searchTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, searchTerm]);

  // Debounce: auto-search 500ms after typing stops
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setSearchTerm(searchInput);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handlePageChange = (newPage: number) => setPage(newPage);
  const handleLimitChange = (newLimit: number) => { setLimit(newLimit); setPage(1); };

  const handleOpenAddModal = () => {
    setSelectedMember(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (member: Member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (member: Member) => {
    setSelectedMember(member);
    setIsDeleteModalOpen(true);
  };

  const handleAddOrEditMember = async (formData: MemberFormData) => {    try {
      setIsSubmitting(true);
      if (selectedMember) {
        await axios.put(`/members/${selectedMember.id}`, formData);
      } else {
        await axios.post('/members', formData);
      }
      await fetchMembers(page, limit, searchTerm);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving member:', err);
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || 'Failed to save member');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedMember) return;
    try {
      setIsSubmitting(true);
      await axios.delete(`/members/${selectedMember.id}`);
      await fetchMembers(page, limit, searchTerm);
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error('Error deleting member:', err);
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || 'Failed to delete member');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<Member>[] = [
    {
      header: 'Name',
      accessor: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900">{row.name}</span>
          <span className="text-[10px] text-slate-400 uppercase tracking-tight">ID: {String(row.id).substring(0, 8)}</span>
        </div>
      ),
    },
    { header: 'Contact', accessor: 'contact' },
    { header: 'Email', accessor: (row) => row.email || <span className="text-slate-300 italic">Not set</span> },
    {
      header: 'Address',
      accessor: (row) =>
        row.address ? (
          <span className="truncate max-w-[180px] block text-xs text-slate-500">{row.address}</span>
        ) : (
          '-'
        ),
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center gap-1">
          <Button onClick={(e) => { e.stopPropagation(); handleOpenEditModal(row); }} icon={Edit2} label="Edit Member" alwaysIconOnly variant="ghost-blue" size="sm" />
          <Button onClick={(e) => { e.stopPropagation(); handleOpenDeleteModal(row); }} icon={Trash2} label="Delete Member" alwaysIconOnly variant="ghost-red" size="sm" />
        </div>
      ),
    },
  ];

  return (
    <div className="p-0">
      <div className="flex items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Member Directory</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Create, update, and manage all participants.</p>
        </div>
        <Button onClick={handleOpenAddModal} icon={UserPlus} label="Add Member" hideLabel />
      </div>

      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm mb-6 flex items-center gap-3 group focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 transition-all">
        <Search className="text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search by name, contact or email..."
          className="flex-1 outline-none text-slate-700 placeholder:text-slate-400 font-medium text-sm"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        {searchInput && (
          <button type="button" onClick={() => { setSearchInput(''); setSearchTerm(''); setPage(1); }} className="text-slate-400 hover:text-slate-600 transition-colors text-xs font-bold">✕</button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-500">
          <Loader2 className="animate-spin mb-4" size={40} />
          <p className="font-medium">Fetching directory...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-rose-500 bg-rose-50 rounded-2xl border border-rose-100 italic">
          <AlertCircle className="mb-4" size={40} />
          <p className="font-bold">{error}</p>
          <button
            onClick={() => fetchMembers(page, limit, searchTerm)}
            className="mt-4 text-xs font-black uppercase tracking-widest text-rose-600 hover:text-rose-800"
          >
            Refresh
          </button>
        </div>
      ) : (
        <div className="card-clean">
          <DataTable
            columns={columns}
            data={members}
            onRowClick={(row) => navigate(`/members/${row.id}`)}
            pagination={{ page, limit, total, onPageChange: handlePageChange, onLimitChange: handleLimitChange }}
          />
        </div>
      )}

      {/* Add/Edit Member Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title={selectedMember ? 'Update Member Details' : 'Register New Member'}
      >
        <MemberForm onSubmit={handleAddOrEditMember} isLoading={isSubmitting} initialData={selectedMember} />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !isSubmitting && setIsDeleteModalOpen(false)}
        title="Delete Member"
        maxWidth="max-w-sm"
      >
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <Trash2 size={32} />
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">
            Are you sure you want to delete{' '}
            <span className="font-bold text-slate-900">{selectedMember?.name}</span>? This action cannot be undone.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-colors text-sm shadow-lg shadow-rose-100"
            >
              {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Delete Now'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MembersPage;
