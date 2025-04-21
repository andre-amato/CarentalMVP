// src/App.tsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { UserProvider, useUser } from './contexts/UserContext';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import BookingPage from './pages/BookingPage';
import ManageBookingsPage from './pages/ManageBookingsPage';
import SettingsPage from './pages/SettingsPage';
import Layout from './components/Layout';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useUser();

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        Loading...
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to='/' replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  const { currentUser } = useUser();

  return (
    <Routes>
      <Route
        path='/'
        element={
          currentUser ? <Navigate to='/dashboard' replace /> : <LoginPage />
        }
      />
      <Route
        path='/dashboard'
        element={
          <ProtectedRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path='/book'
        element={
          <ProtectedRoute>
            <Layout>
              <BookingPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path='/bookings'
        element={
          <ProtectedRoute>
            <Layout>
              <ManageBookingsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path='/settings'
        element={
          <ProtectedRoute>
            <Layout>
              <SettingsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <Router>
          <AppRoutes />
        </Router>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
