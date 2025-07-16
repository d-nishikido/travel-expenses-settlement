import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import './styles/globals.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-secondary-50">
          <div className="container mx-auto px-4 py-8">
            <header className="text-center mb-8">
              <h1 className="text-3xl font-bold text-secondary-900">
                出張精算システム
              </h1>
              <p className="text-secondary-600 mt-2">
                Travel Expenses Settlement System
              </p>
            </header>
            
            <main className="card max-w-2xl mx-auto">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

// Temporary placeholder components
const HomePage = () => (
  <div className="text-center">
    <h2 className="text-xl font-semibold text-secondary-900 mb-4">
      ホーム
    </h2>
    <p className="text-secondary-600">
      システムが正常に起動しています。
    </p>
  </div>
);

const LoginPage = () => (
  <div className="text-center">
    <h2 className="text-xl font-semibold text-secondary-900 mb-4">
      ログイン
    </h2>
    <p className="text-secondary-600">
      ログインページ（開発中）
    </p>
  </div>
);

const DashboardPage = () => (
  <div className="text-center">
    <h2 className="text-xl font-semibold text-secondary-900 mb-4">
      ダッシュボード
    </h2>
    <p className="text-secondary-600">
      ダッシュボード（開発中）
    </p>
  </div>
);

export default App;