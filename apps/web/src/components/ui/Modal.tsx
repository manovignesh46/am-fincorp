import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
  compact?: boolean;
}

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md', compact = false }: ModalProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Stop touch events from bubbling through the React portal tree to Layout's
  // swipe gesture handlers — otherwise any touch inside the modal triggers the
  // sidebar-open logic.
  const stopTouch = (e: React.TouchEvent) => e.stopPropagation();

  return ReactDOM.createPortal(
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col sm:justify-center sm:items-center sm:p-6',
        compact ? 'justify-center items-center p-4' : 'justify-end'
      )}
      onTouchStart={stopTouch}
      onTouchMove={stopTouch}
      onTouchEnd={stopTouch}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200"
        onClick={onClose}
      />
      {/* Dialog */}
      <div className={cn(
        'relative bg-white w-full flex flex-col',
        compact ? 'rounded-2xl' : 'rounded-t-2xl sm:rounded-2xl',
        'shadow-2xl border border-slate-200',
        'animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200',
        compact
          ? 'h-auto max-h-[90vh]'
          : 'h-[88vh] sm:h-auto sm:max-h-[90vh]',
        maxWidth
      )}>
        {/* Drag handle (mobile only, non-compact) */}
        {!compact && (
          <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-10 h-1 rounded-full bg-slate-300" />
          </div>
        )}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <h3 className="text-lg font-bold text-slate-900 leading-none">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
