import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ExpenseReport, ExpenseItem, ApprovalHistory } from '@/types';
import { Button } from '@/components/common/Button';
import { ExpenseItemCard } from '@/components/features/expense-reports/ExpenseItemCard';
import { api } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { EXPENSE_STATUSES } from '@/utils/constants';
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  CheckIcon, 
  XMarkIcon,
  CurrencyYenIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';

export const ExpenseReportDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [report, setReport] = useState<ExpenseReport | null>(null);
  const [items, setItems] = useState<ExpenseItem[]>([]);
  const [history, setHistory] = useState<ApprovalHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (!id) {
      navigate('/expense-reports');
      return;
    }
    fetchReportDetails();
  }, [id, navigate]);

  const fetchReportDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [reportResponse, itemsResponse, historyResponse] = await Promise.all([
        api.expenseReports.getById(id!),
        api.expenseItems.getByReportId(id!),
        api.expenseReports.getHistory(id!)
      ]);
      
      if (reportResponse.success) {
        setReport(reportResponse.data);
      } else {
        throw new Error(reportResponse.message || '申請の取得に失敗しました');
      }
      
      if (itemsResponse.success) {
        setItems(itemsResponse.data || []);
      }
      
      if (historyResponse.success) {
        setHistory(historyResponse.data || []);
      }
    } catch (err: any) {
      setError(err.message || '申請の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!report) return;
    
    try {
      setActionLoading(true);
      await api.expenseReports.approve(report.id, comment || undefined);
      setShowApprovalModal(false);
      setComment('');
      fetchReportDetails(); // Refresh data
    } catch (err: any) {
      setError(err.message || '承認に失敗しました');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!report) return;
    
    try {
      setActionLoading(true);
      await api.expenseReports.reject(report.id, comment);
      setShowRejectModal(false);
      setComment('');
      fetchReportDetails(); // Refresh data
    } catch (err: any) {
      setError(err.message || '却下に失敗しました');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!report) return;
    
    try {
      setActionLoading(true);
      await api.expenseReports.markAsPaid(report.id, comment || undefined);
      setShowPayModal(false);
      setComment('');
      fetchReportDetails(); // Refresh data
    } catch (err: any) {
      setError(err.message || '支払い処理に失敗しました');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!report) return;
    
    try {
      setActionLoading(true);
      await api.expenseReports.submit(report.id);
      fetchReportDetails(); // Refresh data
    } catch (err: any) {
      setError(err.message || '申請の提出に失敗しました');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error}</div>
          <Button
            onClick={() => navigate('/expense-reports')}
            variant="outline"
            className="mt-2"
          >
            申請一覧に戻る
          </Button>
        </div>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  const statusConfig = EXPENSE_STATUSES.find(status => status.value === report.status);
  const canEdit = report.status === 'draft' && (user?.role === 'employee' || user?.id === report.user_id);
  const canSubmit = report.status === 'draft' && (user?.role === 'employee' || user?.id === report.user_id);
  const canApprove = report.status === 'submitted' && user?.role === 'accounting';
  const canMarkAsPaid = report.status === 'approved' && user?.role === 'accounting';

  const getStatusColorClasses = (color: string) => {
    switch (color) {
      case 'gray': return 'bg-gray-100 text-gray-800';
      case 'blue': return 'bg-blue-100 text-blue-800';
      case 'green': return 'bg-green-100 text-green-800';
      case 'red': return 'bg-red-100 text-red-800';
      case 'purple': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'submitted': return '申請';
      case 'approved': return '承認';
      case 'rejected': return '却下';
      case 'paid': return '支払い完了';
      default: return action;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            onClick={() => navigate('/expense-reports')}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            一覧に戻る
          </Button>
          
          {statusConfig && (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColorClasses(statusConfig.color)}`}>
              {statusConfig.label}
            </span>
          )}
        </div>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{report.title}</h1>
            <p className="text-gray-600 mt-1">{report.trip_purpose}</p>
          </div>
          
          <div className="flex gap-2">
            {canEdit && (
              <Link to={`/expense-reports/${report.id}/edit`}>
                <Button variant="outline" className="flex items-center gap-2">
                  <PencilIcon className="h-4 w-4" />
                  編集
                </Button>
              </Link>
            )}
            
            {canSubmit && (
              <Button
                onClick={handleSubmit}
                disabled={actionLoading || items.length === 0}
                className="flex items-center gap-2"
              >
                申請を提出
              </Button>
            )}
            
            {canApprove && (
              <>
                <Button
                  onClick={() => setShowApprovalModal(true)}
                  disabled={actionLoading}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <CheckIcon className="h-4 w-4" />
                  承認
                </Button>
                <Button
                  onClick={() => setShowRejectModal(true)}
                  disabled={actionLoading}
                  variant="outline"
                  className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
                >
                  <XMarkIcon className="h-4 w-4" />
                  却下
                </Button>
              </>
            )}
            
            {canMarkAsPaid && (
              <Button
                onClick={() => setShowPayModal(true)}
                disabled={actionLoading}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
              >
                <CurrencyYenIcon className="h-4 w-4" />
                支払い完了
              </Button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Report Details */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">申請詳細</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">出張開始日</dt>
                <dd className="text-sm text-gray-900">{formatDate(report.trip_start_date)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">出張終了日</dt>
                <dd className="text-sm text-gray-900">{formatDate(report.trip_end_date)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">合計金額</dt>
                <dd className="text-lg font-bold text-gray-900">{formatCurrency(report.total_amount)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">作成日</dt>
                <dd className="text-sm text-gray-900">{formatDate(report.created_at)}</dd>
              </div>
            </div>
          </div>

          {/* Expense Items */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">精算項目</h2>
              {canEdit && (
                <Link to={`/expense-reports/${report.id}/edit`}>
                  <Button variant="outline" size="sm">項目を追加</Button>
                </Link>
              )}
            </div>
            
            {items.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                精算項目がありません
                {canEdit && (
                  <div className="mt-2">
                    <Link to={`/expense-reports/${report.id}/edit`}>
                      <Button variant="outline" size="sm">項目を追加</Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <ExpenseItemCard
                    key={item.id}
                    item={item}
                    onEdit={() => {}} // Read-only in detail view
                    onDelete={() => {}} // Read-only in detail view
                    disabled={true}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Approval History */}
          <div className="bg-white border border-gray-200 rounded-lg p-6" data-testid="approval-history">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ClockIcon className="h-5 w-5" />
              承認履歴
            </h2>
            
            {history.length === 0 ? (
              <div className="text-center py-4 text-gray-500">履歴がありません</div>
            ) : (
              <div className="space-y-4">
                {history.map((historyItem) => (
                  <div key={historyItem.id} className="border-l-2 border-gray-200 pl-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{getActionLabel(historyItem.action)}</span>
                      <UserIcon className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="text-sm text-gray-500 mb-2">
                      {formatDate(historyItem.created_at)}
                    </div>
                    {historyItem.comment && (
                      <div className="text-sm text-gray-700 bg-gray-50 rounded p-2">
                        {historyItem.comment}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">申請を承認しますか？</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                コメント（任意）
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="承認理由やコメントを入力..."
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowApprovalModal(false);
                  setComment('');
                }}
                className="flex-1"
                disabled={actionLoading}
              >
                キャンセル
              </Button>
              <Button
                onClick={handleApprove}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={actionLoading}
              >
                {actionLoading ? '処理中...' : '承認'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">申請を却下しますか？</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                却下理由 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="却下理由を入力してください..."
                required
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectModal(false);
                  setComment('');
                }}
                className="flex-1"
                disabled={actionLoading}
              >
                キャンセル
              </Button>
              <Button
                onClick={handleReject}
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={actionLoading || !comment.trim()}
              >
                {actionLoading ? '処理中...' : '却下'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Pay Modal */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">支払い完了にしますか？</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                コメント（任意）
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="支払い完了に関するコメント..."
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPayModal(false);
                  setComment('');
                }}
                className="flex-1"
                disabled={actionLoading}
              >
                キャンセル
              </Button>
              <Button
                onClick={handleMarkAsPaid}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                disabled={actionLoading}
              >
                {actionLoading ? '処理中...' : '支払い完了'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};