import React from 'react';
import { ExpenseItem } from '@/types';
import { Button } from '@/components/common/Button';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { EXPENSE_CATEGORIES } from '@/utils/constants';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface ExpenseItemCardProps {
  item: ExpenseItem;
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
}

export const ExpenseItemCard: React.FC<ExpenseItemCardProps> = ({
  item,
  onEdit,
  onDelete,
  disabled = false,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const categoryLabel = EXPENSE_CATEGORIES.find(cat => cat.value === item.category)?.label || item.category;

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete();
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow" data-testid="expense-item">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {categoryLabel}
            </span>
            <span className="text-lg font-semibold text-gray-900" data-testid="item-amount">
              {formatCurrency(item.amount)}
            </span>
          </div>
          
          <p className="text-gray-700 mb-2">{item.description}</p>
          
          <p className="text-sm text-gray-500">
            費用発生日: {formatDate(item.expense_date)}
          </p>
          
          {item.receipt_url && (
            <p className="text-sm text-blue-600 mt-1">
              領収書添付済み
            </p>
          )}
        </div>

        {!disabled && (
          <div className="flex gap-2 ml-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="p-2"
              data-testid="edit-item-button"
            >
              <PencilIcon className="h-4 w-4" />
              <span className="sr-only">編集</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="p-2 text-red-600 hover:text-red-700 hover:border-red-300"
              data-testid="delete-item-button"
            >
              <TrashIcon className="h-4 w-4" />
              <span className="sr-only">削除</span>
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">項目を削除しますか？</h3>
            <p className="text-sm text-gray-600 mb-6">
              この操作は取り消せません。本当にこの精算項目を削除しますか？
            </p>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelDelete}
                className="flex-1"
              >
                キャンセル
              </Button>
              <Button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                data-testid="confirm-delete"
              >
                削除
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};