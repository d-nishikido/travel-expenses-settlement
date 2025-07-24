import React from 'react';
import { Link } from 'react-router-dom';
import { ExpenseReport } from '@/types';
import { Button } from '@/components/common/Button';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { EXPENSE_STATUSES } from '@/utils/constants';
import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';

interface ExpenseReportCardProps {
  report: ExpenseReport;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const ExpenseReportCard: React.FC<ExpenseReportCardProps> = ({
  report,
  onEdit,
  onDelete,
}) => {
  const { user } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  
  const statusConfig = EXPENSE_STATUSES.find(status => status.value === report.status);
  const canEdit = report.status === 'draft' && (user?.role === 'employee' || user?.id === report.user_id);
  const canDelete = report.status === 'draft' && (user?.role === 'employee' || user?.id === report.user_id);

  const getStatusColorClasses = (color: string) => {
    switch (color) {
      case 'gray':
        return 'bg-gray-100 text-gray-800';
      case 'blue':
        return 'bg-blue-100 text-blue-800';
      case 'green':
        return 'bg-green-100 text-green-800';
      case 'red':
        return 'bg-red-100 text-red-800';
      case 'purple':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete?.();
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow" data-testid="expense-report-card">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {report.title}
            </h3>
            {statusConfig && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColorClasses(statusConfig.color)}`}>
                {statusConfig.label}
              </span>
            )}
          </div>
          
          <p className="text-gray-600 mb-2">{report.trip_purpose}</p>
          
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
            <span>
              出張期間: {formatDate(report.trip_start_date)} 〜 {formatDate(report.trip_end_date)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-gray-900" data-testid="report-total">
              {formatCurrency(report.total_amount)}
            </span>
            <span className="text-sm text-gray-500">
              作成日: {formatDate(report.created_at)}
            </span>
          </div>
        </div>

        <div className="flex gap-2 ml-4">
          <Link to={`/expense-reports/${report.id}`}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="p-2"
              data-testid="view-report-button"
            >
              <EyeIcon className="h-4 w-4" />
              <span className="sr-only">詳細表示</span>
            </Button>
          </Link>
          
          {canEdit && onEdit && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="p-2"
              data-testid="edit-report-button"
            >
              <PencilIcon className="h-4 w-4" />
              <span className="sr-only">編集</span>
            </Button>
          )}
          
          {canDelete && onDelete && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="p-2 text-red-600 hover:text-red-700 hover:border-red-300"
              data-testid="delete-report-button"
            >
              <TrashIcon className="h-4 w-4" />
              <span className="sr-only">削除</span>
            </Button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">申請を削除しますか？</h3>
            <p className="text-sm text-gray-600 mb-6">
              この操作は取り消せません。本当にこの精算申請を削除しますか？
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