import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ExpenseReport, ExpenseItem } from '@/types';
import { FormInput } from '@/components/common/FormInput';
import { FormTextarea } from '@/components/common/FormTextarea';
import { Button } from '@/components/common/Button';
import { ExpenseItemList } from './ExpenseItemList';
import { formatDateForInput, formatCurrency } from '@/utils/formatters';

const schema = yup.object({
  title: yup.string().required('タイトルは必須です').max(200, 'タイトルは200文字以内で入力してください'),
  trip_purpose: yup.string().required('出張目的は必須です'),
  trip_start_date: yup.date().required('出張開始日は必須です'),
  trip_end_date: yup.date()
    .required('出張終了日は必須です')
    .min(yup.ref('trip_start_date'), '終了日は開始日以降の日付を選択してください'),
});

interface ExpenseReportFormData {
  title: string;
  trip_purpose: string;
  trip_start_date: Date;
  trip_end_date: Date;
}

interface ExpenseReportFormProps {
  initialData?: Partial<ExpenseReport>;
  initialItems?: ExpenseItem[];
  onSubmit: (data: ExpenseReportFormData, items: ExpenseItem[], action: 'save' | 'submit') => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
  isLoading?: boolean;
}

export const ExpenseReportForm: React.FC<ExpenseReportFormProps> = ({
  initialData,
  initialItems = [],
  onSubmit,
  onCancel,
  isEdit = false,
  isLoading = false,
}) => {
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>(initialItems);
  const [totalAmount, setTotalAmount] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ExpenseReportFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: initialData?.title || '',
      trip_purpose: initialData?.trip_purpose || '',
      trip_start_date: initialData?.trip_start_date ? new Date(initialData.trip_start_date) : undefined,
      trip_end_date: initialData?.trip_end_date ? new Date(initialData.trip_end_date) : undefined,
    },
  });

  // Calculate total amount when items change
  useEffect(() => {
    const total = expenseItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    setTotalAmount(total);
  }, [expenseItems]);

  const handleAddItem = (item: Omit<ExpenseItem, 'id' | 'expense_report_id' | 'created_at' | 'updated_at'>) => {
    const newItem: ExpenseItem = {
      ...item,
      id: `temp-${Date.now()}`,
      expense_report_id: initialData?.id || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setExpenseItems(prev => [...prev, newItem]);
  };

  const handleUpdateItem = (id: string, updatedItem: Partial<ExpenseItem>) => {
    setExpenseItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, ...updatedItem, updated_at: new Date().toISOString() }
          : item
      )
    );
  };

  const handleDeleteItem = (id: string) => {
    setExpenseItems(prev => prev.filter(item => item.id !== id));
  };

  const onSave = (data: ExpenseReportFormData) => {
    onSubmit(data, expenseItems, 'save');
  };

  const onSubmitForApproval = (data: ExpenseReportFormData) => {
    onSubmit(data, expenseItems, 'submit');
  };

  const canSubmit = expenseItems.length > 0 && totalAmount > 0;
  const isEditable = !initialData?.status || initialData.status === 'draft' || initialData.status === 'rejected';

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? '精算申請編集' : '新規精算申請'}
        </h1>
        {initialData?.status === 'rejected' && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">
              この申請は却下されました。内容を修正して再提出してください。
            </p>
          </div>
        )}
      </div>

      <form className="p-6 space-y-6">
        {/* Basic Information */}
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <FormInput
                label="申請タイトル"
                required
                placeholder="例：東京出張 - 顧客訪問"
                error={errors.title?.message}
                disabled={!isEditable || isLoading}
                {...register('title')}
              />
            </div>
            <div className="md:col-span-2">
              <FormTextarea
                label="出張目的"
                required
                placeholder="出張の目的や内容を詳しく記載してください"
                rows={3}
                error={errors.trip_purpose?.message}
                disabled={!isEditable || isLoading}
                {...register('trip_purpose')}
              />
            </div>
            <div>
              <FormInput
                label="出張開始日"
                type="date"
                required
                error={errors.trip_start_date?.message}
                disabled={!isEditable || isLoading}
                {...register('trip_start_date')}
              />
            </div>
            <div>
              <FormInput
                label="出張終了日"
                type="date"
                required
                error={errors.trip_end_date?.message}
                disabled={!isEditable || isLoading}
                {...register('trip_end_date')}
              />
            </div>
          </div>
        </div>

        {/* Expense Items */}
        <div className="border-b border-gray-200 pb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">精算項目</h2>
            <div className="text-right">
              <p className="text-sm text-gray-600">合計金額</p>
              <p className="text-xl font-bold text-blue-600" data-testid="total-amount">{formatCurrency(totalAmount)}</p>
            </div>
          </div>
          <ExpenseItemList
            items={expenseItems}
            onAddItem={handleAddItem}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            disabled={!isEditable || isLoading}
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="sm:order-1"
          >
            キャンセル
          </Button>
          
          {isEditable && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleSubmit(onSave)}
                disabled={isLoading}
                className="sm:order-2"
              >
                下書き保存
              </Button>
              
              <Button
                type="button"
                onClick={handleSubmit(onSubmitForApproval)}
                disabled={isLoading || !canSubmit}
                className="sm:order-3"
              >
                申請を提出
              </Button>
            </>
          )}
        </div>

        {!canSubmit && isEditable && (
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              申請を提出するには、1つ以上の精算項目を追加してください。
            </p>
          </div>
        )}
      </form>
    </div>
  );
};