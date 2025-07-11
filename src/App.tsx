import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { EventsPage } from './pages/EventsPage';
import { DealsPage } from './pages/DealsPage';
import { ProfilePage } from './pages/ProfilePage';
import { MessagesPage } from './pages/MessagesPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { ConsentFormsPage } from './pages/ConsentFormsPage';
import { RegistrationPage } from './pages/RegistrationPage';
import { ArtistBookingPage } from './pages/ArtistBookingPage';
import { ArtistConsentPage } from './pages/ArtistConsentPage';
import { ClientBookingPage } from './pages/ClientBookingPage';
import { ClientConsentPage } from './pages/ClientConsentPage';
import { ClientTicketsPage } from './pages/ClientTicketsPage';
import { TattScoreAdminPage } from './pages/TattScoreAdminPage';
import { TattScoreJudgingPage } from './pages/TattScoreJudgingPage';
import { StudioDashboardPage } from './pages/StudioDashboardPage';
import { AttendeeProfilePage } from './pages/AttendeeProfilePage';
import { TicketManagementPage } from './pages/TicketManagementPage';
import { ConsentScanPage } from './pages/ConsentScanPage';
import { EventApplicationPage } from './pages/EventApplicationPage';
import { RegistrationFormPage } from './pages/RegistrationFormPage';
import { RegistrationSuccessPage } from './pages/RegistrationSuccessPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminConsentTemplatesPage } from './pages/AdminConsentTemplatesPage';
import { AdminAftercareTemplatesPage } from './pages/AdminAftercareTemplatesPage';
import { EventSettingsPage } from './pages/EventSettingsPage';
import { DashboardPage } from './pages/DashboardPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:eventSlug" element={<EventApplicationPage />} />
        <Route path="/deals" element={<DealsPage />} />
        <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/messages" element={user ? <MessagesPage /> : <Navigate to="/login" />} />
        <Route path="/dashboard" element={user ? <DashboardPage /> : <Navigate to="/login" />} />
        <Route path="/admin/users" element={user?.role === 'admin' ? <AdminUsersPage /> : <Navigate to="/dashboard" />} />
        <Route path="/admin/consent-templates" element={user?.role === 'admin' ? <AdminConsentTemplatesPage /> : <Navigate to="/dashboard" />} />
        <Route path="/admin/aftercare-templates" element={user?.role === 'admin' ? <AdminAftercareTemplatesPage /> : <Navigate to="/dashboard" />} />
        <Route path="/consent-forms" element={user ? <ConsentFormsPage /> : <Navigate to="/login" />} />
        <Route path="/login" element={<RegistrationPage />} />
        <Route path="/artist-booking" element={user ? <ArtistBookingPage /> : <Navigate to="/login" />} />
        <Route path="/artist-consent" element={user ? <ArtistConsentPage /> : <Navigate to="/login" />} />
        <Route path="/client-booking" element={user ? <ClientBookingPage /> : <Navigate to="/login" />} />
        <Route path="/client-consent" element={user ? <ClientConsentPage /> : <Navigate to="/login" />} />
        <Route path="/client-tickets" element={user ? <ClientTicketsPage /> : <Navigate to="/login" />} />
        <Route path="/tattscore/admin" element={user ? <TattScoreAdminPage /> : <Navigate to="/login" />} />
        <Route path="/tattscore/judging" element={user ? <TattScoreJudgingPage /> : <Navigate to="/login" />} />
        <Route path="/studio/dashboard" element={user ? <StudioDashboardPage /> : <Navigate to="/login" />} />
        <Route path="/attendee/:id" element={<AttendeeProfilePage />} />
        <Route path="/ticket-management" element={user ? <TicketManagementPage /> : <Navigate to="/login" />} />
        <Route path="/consent/scan/:code" element={<ConsentScanPage />} />
        <Route path="/registration/:token" element={<RegistrationFormPage />} />
        <Route path="/registration-success" element={<RegistrationSuccessPage />} />
        <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboardPage /> : <Navigate to="/dashboard" />} />
        <Route path="/event-settings" element={user ? <EventSettingsPage /> : <Navigate to="/login" />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;