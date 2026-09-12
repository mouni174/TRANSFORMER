import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CompaniesPage } from './pages/CompaniesPage';
import { CompanyDetailPage } from './pages/CompanyDetailPage';
import { TransformersPage } from './pages/TransformersPage';
import { TransformerDetailPage } from './pages/TransformerDetailPage';
import { ServiceRecordsPage } from './pages/ServiceRecordsPage';
import { ServiceRecordDetailPage } from './pages/ServiceRecordDetailPage';
import { WarrantyAlertsPage } from './pages/WarrantyAlertsPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Application Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/companies"
            element={
              <ProtectedRoute>
                <CompaniesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/companies/:id"
            element={
              <ProtectedRoute>
                <CompanyDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transformers"
            element={
              <ProtectedRoute>
                <TransformersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transformers/:id"
            element={
              <ProtectedRoute>
                <TransformerDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/service-records"
            element={
              <ProtectedRoute>
                <ServiceRecordsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/service-records/:id"
            element={
              <ProtectedRoute>
                <ServiceRecordDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/warranties"
            element={
              <ProtectedRoute>
                <WarrantyAlertsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
