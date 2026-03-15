import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import ChitFundForm from '../components/chitfunds/ChitFundForm';
import { ChitFund } from '../types';

const ChitFundFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [fund, setFund] = useState<ChitFund | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit || !id) return;
    const fetchFund = async () => {
      try {
        setLoading(true);
        const res = await axios.get<{ data: ChitFund }>(`/chit-funds/${id}`);
        setFund(res.data.data);
        setError(null);
      } catch {
        setError('Failed to load chit fund data.');
      } finally {
        setLoading(false);
      }
    };
    fetchFund();
  }, [id, isEdit]);

  const handleSubmit = async (formData: Record<string, unknown>) => {
    try {
      setIsSubmitting(true);
      if (isEdit && id) {
        await axios.put(`/chit-funds/${id}`, formData);
        navigate(`/chitfunds/${id}`);
      } else {
        const res = await axios.post<{ data: ChitFund }>('/chit-funds', formData);
        navigate(`/chitfunds/${res.data.data.id}`);
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || 'Failed to save chit fund');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isEdit ? 'Edit Chit Fund' : 'New Chit Fund'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {isEdit
              ? 'Update the chit fund details below.'
              : 'Fill in the details to create a new chit fund.'}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-500">
          <Loader2 className="animate-spin" size={40} />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-rose-500 bg-rose-50 rounded-2xl border border-rose-100">
          <AlertCircle size={40} className="mb-3" />
          <p className="font-bold">{error}</p>
          <button
            onClick={() => navigate('/chitfunds')}
            className="mt-4 text-sm font-bold text-rose-600 hover:text-rose-800"
          >
            ← Back to Chit Funds
          </button>
        </div>
      ) : (
        <div className="max-w-lg">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <ChitFundForm
              onSubmit={handleSubmit}
              initialData={fund}
              isLoading={isSubmitting}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChitFundFormPage;
