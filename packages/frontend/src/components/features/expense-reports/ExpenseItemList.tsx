import React, { useState } from 'react';
import { ExpenseItem } from '@/types';
import { ExpenseItemForm } from './ExpenseItemForm';
import { ExpenseItemCard } from './ExpenseItemCard';
import { Button } from '@/components/common/Button';
import { PlusIcon } from '@heroicons/react/24/outline';

interface ExpenseItemListProps {
  items: ExpenseItem[];
  onAddItem: (item: Omit<ExpenseItem, 'id' | 'expense_report_id' | 'created_at' | 'updated_at'>) => void;
  onUpdateItem: (id: string, item: Partial<ExpenseItem>) => void;
  onDeleteItem: (id: string) => void;
  disabled?: boolean;
}

export const ExpenseItemList: React.FC<ExpenseItemListProps> = ({
  items,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  disabled = false,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddItem = (item: Omit<ExpenseItem, 'id' | 'expense_report_id' | 'created_at' | 'updated_at'>) => {
    onAddItem(item);
    setShowAddForm(false);
  };

  const handleEditItem = (id: string) => {
    setEditingId(id);
  };

  const handleUpdateItem = (id: string, item: Partial<ExpenseItem>) => {
    onUpdateItem(id, item);
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setShowAddForm(false);
  };

  return (
    <div className="space-y-4">
      {items.length === 0 && !showAddForm && (
        <div className="text-center py-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 mb-4">精算項目がまだ追加されていません</p>
          {!disabled && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center"
              data-testid="add-item-button"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              精算項目を追加
            </Button>
          )}
        </div>
      )}

      {items.map((item) => (
        <div key={item.id}>
          {editingId === item.id ? (
            <ExpenseItemForm
              initialData={item}
              onSubmit={(data) => handleUpdateItem(item.id, data)}
              onCancel={handleCancelEdit}
              disabled={disabled}
            />
          ) : (
            <ExpenseItemCard
              item={item}
              onEdit={() => handleEditItem(item.id)}
              onDelete={() => onDeleteItem(item.id)}
              disabled={disabled}
            />
          )}
        </div>
      ))}

      {showAddForm && (
        <ExpenseItemForm
          onSubmit={handleAddItem}
          onCancel={handleCancelEdit}
          disabled={disabled}
        />
      )}

      {!showAddForm && !disabled && items.length > 0 && (
        <div className="pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center"
            data-testid="add-item-button"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            精算項目を追加
          </Button>
        </div>
      )}
    </div>
  );
};