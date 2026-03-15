import React from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import Modal from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: React.ReactNode;
  confirmLabel?: string;
  confirmingLabel?: string;
  isConfirming?: boolean;
  variant?: 'danger' | 'warning';
}

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  confirmingLabel = 'Processing...',
  isConfirming = false,
  variant = 'danger',
}: ConfirmDialogProps) => {
  const confirmCls =
    variant === 'danger'
      ? 'bg-rose-600 hover:bg-rose-700 text-white'
      : 'bg-amber-500 hover:bg-amber-600 text-white';

  return (
    <Modal isOpen={isOpen} onClose={() => !isConfirming && onClose()} title={title} maxWidth="max-w-sm" compact>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
            variant === 'danger' ? 'bg-rose-50' : 'bg-amber-50'
          }`}>
            <AlertTriangle
              size={17}
              className={variant === 'danger' ? 'text-rose-500' : 'text-amber-500'}
            />
          </div>
          <p className="text-sm text-slate-600 pt-1.5">{message}</p>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={isConfirming}
            className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors text-sm disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isConfirming}
            className={`flex-1 px-4 py-2.5 font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50 ${confirmCls}`}
          >
            {isConfirming && <Loader2 size={15} className="animate-spin" />}
            {isConfirming ? confirmingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
