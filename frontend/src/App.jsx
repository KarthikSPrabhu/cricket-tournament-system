import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { MatchProvider } from './context/MatchContext';
import { TournamentProvider } from './context/TournamentContext';

// Layouts
import AdminLayout from './components/Layout/AdminLayout';
import MainLayout from './components/Layout/MainLayout';

// Admin Pages
import AdminLogin from './pages/Admin/Login';
import Dashboard from './pages/Admin/Dashboard';
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

// Common
import ErrorBoundary from './components/Common/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <TournamentProvider>
          <MatchProvider>
            <div className="min-h-screen bg-gray-900">
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: '#1f2937',
                    color: '#fff',
                    border: '1px solid #374151',
                  },
                  success: {
                    style: {
                      background: '#065f46',
                      borderColor: '#047857',
                    },
                  },
                  error: {
                    style: {
                      background: '#7f1d1d',
                      borderColor: '#dc2626',
                    },
                  },
                }}
              />
              
              <Routes>
                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="dashboard" />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="teams" element={<Teams />} />
                  <Route path="players" element={<Players />} />
                  <Route path="tournaments" element={<Tournament />} />
                  <Route path="live-scoring" element={<LiveScoring />} />
                  <Route path="live-scoring/:matchId" element={<LiveScoring />} />
                </Route>

                {/* Viewer Routes */}
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<Home />} />
                  <Route path="live" element={<LiveMatch />} />
                  <Route path="live/:matchId" element={<LiveMatch />} />
                  <Route path="matches" element={<Matches />} />
                  <Route path="leaderboard" element={<Leaderboard />} />
                  <Route path="players" element={<PlayersPage />} />
                  <Route path="stats" element={<Statistics />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </MatchProvider>
        </TournamentProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;