import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { ExpenseReportForm } from '@/components/features/expense-reports/ExpenseReportForm';
import { Layout } from '@/components/layout/Layout';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { api } from '@/services/api';
import { ExpenseItem } from '@/types';

interface ExpenseReportFormData {
  title: string;
  trip_purpose: string;
  trip_start_date: Date;
  trip_end_date: Date;
}

export const EditExpenseReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: report,
    isLoading: isLoadingReport,
    error: reportError,
  } = useQuery(
    ['expense-report', id],
    () => api.expenseReports.getById(id!),
    { enabled: !!id }
  );

  const {
    data: items = [],
    isLoading: isLoadingItems,
  } = useQuery(
    ['expense-items', id],
    () => api.expenseItems.getByReportId(id!),
    { enabled: !!id }
  );

  const updateReportMutation = useMutation(api.expenseReports.update, {
    onSuccess: () => {
      queryClient.invalidateQueries(['expense-report', id]);
      queryClient.invalidateQueries('expense-reports');
    },
  });

  const createItemMutation = useMutation(api.expenseItems.create);
  const updateItemMutation = useMutation(api.expenseItems.update);
  const deleteItemMutation = useMutation(api.expenseItems.delete);

  const handleSubmit = async (
    data: ExpenseReportFormData,
    newItems: ExpenseItem[],
    action: 'save' | 'submit'
  ) => {
    if (!id || !report) return;

    try {
      // Update the expense report
      const reportData = {
        title: data.title,
        trip_purpose: data.trip_purpose,
        trip_start_date: data.trip_start_date,
        trip_end_date: data.trip_end_date,
      };

      await updateReportMutation.mutateAsync({ id, data: reportData });

      // Handle expense items
      const existingItemIds = items.map(item => item.id);
      const newItemIds = newItems.map(item => item.id);

      // Delete removed items
      for (const existingId of existingItemIds) {
        if (!newItemIds.includes(existingId)) {
          await deleteItemMutation.mutateAsync({ reportId: id, id: existingId });
        }
      }

      // Create or update items
      for (const item of newItems) {
        if (item.id.startsWith('temp-')) {
          // Create new item
          await createItemMutation.mutateAsync({
            expense_report_id: id,
            category: item.category,
            description: item.description,
            amount: item.amount,
            expense_date: item.expense_date,
            receipt_url: item.receipt_url,
          });
        } else {
          // Update existing item
          const existingItem = items.find(i => i.id === item.id);
          if (existingItem && (
            existingItem.category !== item.category ||
            existingItem.description !== item.description ||
            existingItem.amount !== item.amount ||
            existingItem.expense_date !== item.expense_date
          )) {
            await updateItemMutation.mutateAsync({
              reportId: id,
              id: item.id,
              data: {
                category: item.category,
                description: item.description,
                amount: item.amount,
                expense_date: item.expense_date,
                receipt_url: item.receipt_url,
              },
            });
          }
        }
      }

      // Submit for approval if requested
      if (action === 'submit') {
        await api.expenseReports.submit(id);
      }

      // Navigate back to expense reports list
      navigate('/expense-reports');
    } catch (error) {
      console.error('Failed to update expense report:', error);
      // TODO: Show error notification
    }
  };

  const handleCancel = () => {
    navigate('/expense-reports');
  };

  if (isLoadingReport || isLoadingItems) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (reportError || !report) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              精算申請が見つかりません
            </h2>
            <p className="text-gray-600 mb-4">
              指定された精算申請が存在しないか、アクセス権限がありません。
            </p>
            <button
              onClick={() => navigate('/expense-reports')}
              className="text-blue-600 hover:text-blue-500"
            >
              精算申請一覧に戻る
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // Check if report can be edited
  const canEdit = report.status === 'draft' || report.status === 'rejected';
  if (!canEdit) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              編集できません
            </h2>
            <p className="text-gray-600 mb-4">
              この精算申請は現在のステータス（{report.status}）では編集できません。
            </p>
            <button
              onClick={() => navigate('/expense-reports')}
              className="text-blue-600 hover:text-blue-500"
            >
              精算申請一覧に戻る
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ExpenseReportForm
            initialData={report}
            initialItems={items}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isEdit={true}
            isLoading={
              updateReportMutation.isLoading ||
              createItemMutation.isLoading ||
              updateItemMutation.isLoading ||
              deleteItemMutation.isLoading
            }
          />
        </div>
      </div>
    </Layout>
  );
};