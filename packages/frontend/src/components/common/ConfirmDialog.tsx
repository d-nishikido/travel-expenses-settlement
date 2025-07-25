import React from 'react';
import { Dialog } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '確認',
  cancelText = 'キャンセル',
  confirmVariant = 'primary',
}) => {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      {/* Full-screen container to center the panel */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white p-6 shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />
            </div>
            <div className="flex-1">
              <Dialog.Title className="text-lg font-medium text-gray-900">
                {title}
              </Dialog.Title>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              {message}
            </p>
          </div>
          
          <div className="mt-6 flex space-x-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              {cancelText}
            </Button>
            <Button
              type="button"
              variant={confirmVariant === 'danger' ? 'outline' : 'primary'}
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={confirmVariant === 'danger' ? 'text-red-600 border-red-300 hover:bg-red-50' : ''}
            >
              {confirmText}
            </Button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};