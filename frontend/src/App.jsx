import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from './context/AuthContext';
import { MatchProvider } from './context/MatchContext';

// Layouts
import MainLayout from './components/Layout/MainLayout';
import AdminLayout from './components/Layout/AdminLayout';

// Admin Pages
import AdminLogin from './pages/Admin/Login';
import AdminDashboard from './pages/Admin/Dashboard';
import Teams from './pages/Admin/Teams';
import Players from './pages/Admin/Players';
import Tournament from './pages/Admin/Tournament';
import LiveScoring from './pages/Admin/LiveScoring';

// Viewer Pages
import Home from './pages/Viewer/Home';
import LiveMatch from './pages/Viewer/LiveMatch';
import Matches from './pages/Viewer/Matches';
import Leaderboard from './pages/Viewer/Leaderboard';
import PlayersPage from './pages/Viewer/Players';
import Statistics from './pages/Viewer/Statistics';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  if (!user) return <Navigate to="/admin/login" />;
  
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return children;
};

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MatchProvider>
          <Router>
            <Toaster position="top-right" />
            <Routes>
              {/* Viewer Routes */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="live-match/:matchId" element={<LiveMatch />} />
                <Route path="matches" element={<Matches />} />
                <Route path="leaderboard" element={<Leaderboard />} />
                <Route path="players" element={<PlayersPage />} />
                <Route path="statistics" element={<Statistics />} />
              </Route>
              
              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute adminOnly>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="dashboard" />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="teams" element={<Teams />} />
                <Route path="players" element={<Players />} />
                <Route path="tournament" element={<Tournament />} />
                <Route path="live-scoring/:matchId" element={<LiveScoring />} />
              </Route>
              
              {/* Admin Login */}
              <Route path="/admin/login" element={<AdminLogin />} />
              
              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Router>
        </MatchProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;