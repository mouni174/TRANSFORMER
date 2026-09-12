import React from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';

export const DeleteTransformerModal = ({ isOpen, transformer, onClose, onConfirm, isDeleting }) => {
  if (!isOpen || !transformer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-start space-x-3 bg-red-50/50">
          <div className="p-2.5 bg-red-100 text-red-600 rounded-full shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-slate-900">Confirm Transformer Deletion</h3>
            <p className="text-xs text-slate-500 mt-0.5">This action is destructive and cannot be undone.</p>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3 text-xs text-slate-700">
          <p>
            Are you sure you want to delete transformer serial number{' '}
            <span className="font-bold text-slate-900 font-mono">{transformer.serial_number}</span> belonging to{' '}
            <span className="font-semibold text-slate-900">{transformer.companyName}</span>?
          </p>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-[11px] leading-relaxed">
            <span className="font-semibold block mb-0.5">Database Cascade Warning:</span>
            Deleting this transformer asset will permanently remove its database record. Any associated historical oil service records will also be deleted per database foreign key cascades.
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-3 text-xs">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 border border-slate-200 rounded-md font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold transition-colors inline-flex items-center space-x-1.5 shadow-xs disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete Transformer</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
