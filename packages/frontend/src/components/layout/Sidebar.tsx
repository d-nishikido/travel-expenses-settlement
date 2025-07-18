import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  HomeIcon, 
  DocumentTextIcon, 
  PlusIcon, 
  ClockIcon,
  UsersIcon,
  ChartBarIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

const employeeNavigation = [
  { name: 'ダッシュボード', href: '/dashboard', icon: HomeIcon },
  { name: '申請作成', href: '/expense-reports/new', icon: PlusIcon },
  { name: '申請一覧', href: '/expense-reports', icon: DocumentTextIcon },
  { name: '申請履歴', href: '/expense-reports/history', icon: ClockIcon },
];

const accountingNavigation = [
  { name: 'ダッシュボード', href: '/accounting/dashboard', icon: HomeIcon },
  { name: '承認待ち', href: '/accounting/pending', icon: CheckCircleIcon },
  { name: '全申請管理', href: '/accounting/reports', icon: DocumentTextIcon },
  { name: 'ユーザー管理', href: '/accounting/users', icon: UsersIcon },
  { name: 'レポート', href: '/accounting/analytics', icon: ChartBarIcon },
];

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const navigation = user?.role === 'accounting' ? accountingNavigation : employeeNavigation;

  return (
    <div className="bg-gray-900 text-white w-64 min-h-screen">
      <div className="p-4">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                  ${isActive 
                    ? 'bg-gray-800 text-white' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }
                `}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};