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
  const categoryLabel = EXPENSE_CATEGORIES.find(cat => cat.value === item.category)?.label || item.category;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {categoryLabel}
            </span>
            <span className="text-lg font-semibold text-gray-900">
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
            >
              <PencilIcon className="h-4 w-4" />
              <span className="sr-only">編集</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="p-2 text-red-600 hover:text-red-700 hover:border-red-300"
            >
              <TrashIcon className="h-4 w-4" />
              <span className="sr-only">削除</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};