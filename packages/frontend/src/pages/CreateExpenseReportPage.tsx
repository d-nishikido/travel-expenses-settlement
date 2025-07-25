import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from 'react-query';
import { ExpenseReportForm } from '@/components/features/expense-reports/ExpenseReportForm';
import { Layout } from '@/components/layout/Layout';
import { api } from '@/services/api';
import { ExpenseItem } from '@/types';

interface ExpenseReportFormData {
  title: string;
  trip_purpose: string;
  trip_start_date: Date;
  trip_end_date: Date;
}

export const CreateExpenseReportPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createReportMutation = useMutation(api.expenseReports.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('expense-reports');
    },
  });

  const createItemMutation = useMutation(
    (data: any) => api.expenseItems.create(data)
  );

  const handleSubmit = async (
    data: ExpenseReportFormData,
    items: ExpenseItem[],
    action: 'save' | 'submit'
  ) => {
    try {
      // Create the expense report
      const reportData = {
        title: data.title,
        trip_purpose: data.trip_purpose,
        trip_start_date: data.trip_start_date,
        trip_end_date: data.trip_end_date,
      };

      const response = await createReportMutation.mutateAsync(reportData);
      // APIレスポンスは { success: true, data: reportObject } の形式
      const report = response.data || response;

      // Create expense items
      for (const item of items) {
        await createItemMutation.mutateAsync({
          expense_report_id: report.id,
          category: item.category,
          description: item.description,
          amount: item.amount,
          expense_date: item.expense_date,
          receipt_url: item.receipt_url,
        });
      }

      // Submit for approval if requested
      if (action === 'submit') {
        await api.expenseReports.submit(report.id);
        // Navigate back to expense reports list only when submitting
        navigate('/expense-reports');
      }
    } catch (error) {
      console.error('Failed to create expense report:', error);
      throw error; // Re-throw to let form handle the error
    }
  };
  
  const handleSaveDraft = async (
    data: ExpenseReportFormData,
    items: ExpenseItem[]
  ) => {
    // Only save draft if there's meaningful content
    if (!data.title && !data.trip_purpose && items.length === 0) {
      return; // Nothing to save
    }
    
    try {
      // Create the expense report as draft
      const reportData = {
        title: data.title,
        trip_purpose: data.trip_purpose,
        trip_start_date: data.trip_start_date,
        trip_end_date: data.trip_end_date,
      };

      const response = await createReportMutation.mutateAsync(reportData);
      // APIレスポンスは { success: true, data: reportObject } の形式
      const report = response.data || response;

      // Create expense items
      for (const item of items) {
        await createItemMutation.mutateAsync({
          expense_report_id: report.id,
          category: item.category,
          description: item.description,
          amount: item.amount,
          expense_date: item.expense_date,
          receipt_url: item.receipt_url,
        });
      }
      
      // Do not navigate - stay on the same page for draft saves
    } catch (error) {
      console.error('Failed to save draft:', error);
      throw error; // Re-throw to let form handle the error
    }
  };

  const handleCancel = () => {
    navigate('/expense-reports');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ExpenseReportForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            onSaveDraft={handleSaveDraft}
            isLoading={createReportMutation.isLoading || createItemMutation.isLoading}
          />
        </div>
      </div>
    </Layout>
  );
};