import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExpenseReport } from '@/types';
import { Button } from '@/components/common/Button';
import { ExpenseReportCard } from '@/components/features/expense-reports/ExpenseReportCard';
import { Layout } from '@/components/layout/Layout';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { EXPENSE_STATUSES } from '@/utils/constants';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export const ExpenseReportListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reports, setReports] = useState<ExpenseReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReports, setTotalReports] = useState(0);

  const itemsPerPage = 10;

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      };
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      const response = await api.expenseReports.getAll(params);
      
      console.log('API Response:', response);
      
      if (response.success) {
        // レスポンス構造を確認 - response.dataが配列の場合とオブジェクトの場合を処理
        const reports = Array.isArray(response.data) ? response.data : (response.data.reports || []);
        setReports(reports);
        setTotalPages(response.data.totalPages || 1);
        setTotalReports(response.data.total || reports.length);
      } else {
        throw new Error(response.message || '申請の取得に失敗しました');
      }
    } catch (err: any) {
      setError(err.message || '申請の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [currentPage, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchReports();
  };

  const handleEdit = (reportId: string) => {
    navigate(`/expense-reports/${reportId}/edit`);
  };

  const handleDelete = async (reportId: string) => {
    try {
      await api.expenseReports.delete(reportId);
      fetchReports(); // Refresh the list
    } catch (err: any) {
      setError(err.message || '申請の削除に失敗しました');
    }
  };

  const handleCreateNew = () => {
    navigate('/expense-reports/new');
  };

  const filteredReports = reports.filter(report => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      report.title.toLowerCase().includes(searchLower) ||
      report.trip_purpose.toLowerCase().includes(searchLower)
    );
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 text-sm font-medium rounded-md ${
            i === currentPage
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-700">
          {totalReports > 0 && (
            <span>
              {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalReports)} 件目 
              （全 {totalReports} 件中）
            </span>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            前へ
          </button>
          {pages}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            次へ
          </button>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">精算申請一覧</h1>
            <p className="text-gray-600 mt-1">
              {user?.role === 'employee' ? '自分の申請一覧' : '全ての申請一覧'}
            </p>
          </div>
          <Button
            onClick={handleCreateNew}
            className="flex items-center gap-2"
            data-testid="create-new-button"
          >
            <PlusIcon className="h-5 w-5" />
            新規申請作成
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="タイトルまたは出張目的で検索..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </form>
            
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">全てのステータス</option>
                {EXPENSE_STATUSES.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error}</div>
          <Button
            onClick={fetchReports}
            variant="outline"
            className="mt-2"
          >
            再試行
          </Button>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            {reports.length === 0 ? '申請がありません' : '検索条件に一致する申請がありません'}
          </div>
          {reports.length === 0 && (
            <Button onClick={handleCreateNew}>
              最初の申請を作成
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <ExpenseReportCard
              key={report.id}
              report={report}
              onEdit={() => handleEdit(report.id)}
              onDelete={() => handleDelete(report.id)}
            />
          ))}
          
          {renderPagination()}
        </div>
      )}
      </div>
    </Layout>
  );
};