import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, Loader2, AlertCircle, Edit2, Trash2,
  User, Phone, Mail, MapPin, StickyNote, Calendar,
} from 'lucide-react';
import Modal from '../components/ui/Modal';
import MemberForm from '../components/members/MemberForm';
import { Member } from '../types';

interface InfoRowProps {
  icon: React.ElementType;
  label: string;
  value?: string | null;
}

const InfoRow = ({ icon: Icon, label, value }: InfoRowProps) => (
  <div className="flex items-start gap-3 py-3.5 border-b border-slate-100 last:border-0">
    <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
      <Icon size={15} className="text-slate-400" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-slate-800 break-words">
        {value || <span className="italic text-slate-300 font-normal">Not set</span>}
      </p>
    </div>
  </div>
);

const MemberDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMember = async () => {
    try {
      setLoading(true);
      const res = await axios.get<{ data: Member }>(`/members/${id}`);
      setMember(res.data.data);
      setError(null);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to load member.');
      } else {
        setError('Failed to load member.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMember(); }, [id]);

  const handleEdit = async (formData: Record<string, unknown>) => {
    try {
      setIsSubmitting(true);
      const res = await axios.put<{ data: Member }>(`/members/${id}`, formData);
      setMember(res.data.data);
      setIsEditModalOpen(false);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || 'Failed to update member.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      await axios.delete(`/members/${id}`);
      navigate('/members');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || 'Failed to delete member.');
      }
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-slate-500">
        <Loader2 className="animate-spin mr-3" size={28} />
        <span className="font-medium">Loading member...</span>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-rose-500 bg-rose-50 rounded-2xl border border-rose-100">
        <AlertCircle size={40} className="mb-3" />
        <p className="font-bold">{error}</p>
        <button onClick={() => navigate('/members')} className="mt-4 text-sm font-bold text-rose-600 hover:text-rose-800">
          ← Back to Members
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate('/members')}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Member Directory</p>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{member.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
          >
            <Edit2 size={15} /> Edit
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-sm font-bold rounded-xl border border-rose-200 transition-colors"
          >
            <Trash2 size={15} /> Delete
          </button>
        </div>
      </div>

      {/* Detail card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6 pb-5 border-b border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-black text-xl">
            {member.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{member.name}</h2>
            <p className="text-sm text-slate-400 font-medium">Member ID: #{member.id}</p>
          </div>
        </div>

        <InfoRow icon={Phone} label="Contact" value={member.contact} />
        <InfoRow icon={Mail} label="Email" value={member.email} />
        <InfoRow icon={MapPin} label="Address" value={member.address} />
        <InfoRow icon={StickyNote} label="Notes" value={member.notes} />
        <InfoRow
          icon={Calendar}
          label="Registered On"
          value={new Date(member.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'long', year: 'numeric',
          })}
        />
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => !isSubmitting && setIsEditModalOpen(false)}
        title="Update Member Details"
      >
        <MemberForm onSubmit={handleEdit} isLoading={isSubmitting} initialData={member} />
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !isSubmitting && setIsDeleteModalOpen(false)}
        title="Delete Member"
        maxWidth="max-w-sm"
      >
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
            <Trash2 size={32} />
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">
            Are you sure you want to delete <span className="font-bold text-slate-900">{member.name}</span>?
            This action cannot be undone.
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
              onClick={handleDelete}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-colors text-sm"
            >
              {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MemberDetailPage;
