import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ExpenseItem } from '@/types';
import { FormInput } from '@/components/common/FormInput';
import { FormTextarea } from '@/components/common/FormTextarea';
import { FormSelect } from '@/components/common/FormSelect';
import { Button } from '@/components/common/Button';
import { EXPENSE_CATEGORIES } from '@/utils/constants';
import { formatDateForInput } from '@/utils/formatters';

const schema = yup.object({
  category: yup.string().required('カテゴリーを選択してください'),
  description: yup.string().required('項目説明は必須です').max(500, '項目説明は500文字以内で入力してください'),
  amount: yup.number()
    .required('金額は必須です')
    .min(1, '金額は1円以上で入力してください')
    .max(9999999, '金額が大きすぎます'),
  expense_date: yup.date().required('費用発生日は必須です'),
});

interface ExpenseItemFormData {
  category: string;
  description: string;
  amount: number;
  expense_date: Date;
}

interface ExpenseItemFormProps {
  initialData?: Partial<ExpenseItem>;
  onSubmit: (data: Omit<ExpenseItem, 'id' | 'expense_report_id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  disabled?: boolean;
}

export const ExpenseItemForm: React.FC<ExpenseItemFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  disabled = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExpenseItemFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      category: initialData?.category || '',
      description: initialData?.description || '',
      amount: initialData?.amount || 0,
      expense_date: initialData?.expense_date ? new Date(initialData.expense_date) : undefined,
    },
  });

  const onSubmitForm = (data: ExpenseItemFormData) => {
    onSubmit({
      category: data.category as any,
      description: data.description,
      amount: data.amount,
      expense_date: data.expense_date,
      receipt_url: initialData?.receipt_url || null,
    });
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {initialData ? '精算項目を編集' : '新しい精算項目'}
      </h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelect
            label="カテゴリー"
            required
            options={EXPENSE_CATEGORIES}
            placeholder="カテゴリーを選択"
            error={errors.category?.message}
            disabled={disabled}
            {...register('category')}
          />
          
          <FormInput
            label="金額"
            type="number"
            required
            placeholder="0"
            min={1}
            step={1}
            error={errors.amount?.message}
            disabled={disabled}
            {...register('amount', { valueAsNumber: true })}
          />
        </div>

        <FormInput
          label="費用発生日"
          type="date"
          required
          error={errors.expense_date?.message}
          disabled={disabled}
          {...register('expense_date')}
        />

        <FormTextarea
          label="項目説明"
          required
          placeholder="交通手段、宿泊先、食事の内容など詳細を記載してください"
          rows={3}
          error={errors.description?.message}
          disabled={disabled}
          {...register('description')}
        />

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={disabled}
          >
            キャンセル
          </Button>
          <Button
            type="button"
            onClick={handleSubmit(onSubmitForm)}
            disabled={disabled}
            data-testid="save-item-button"
          >
            {initialData ? '更新' : '追加'}
          </Button>
        </div>
      </div>
    </div>
  );
};