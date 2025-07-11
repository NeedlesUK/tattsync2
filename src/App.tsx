import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { EventsPage } from './pages/EventsPage';
import { MessagesPage } from './pages/MessagesPage';
import { DealsPage } from './pages/DealsPage';
import { RegistrationPage } from './pages/RegistrationPage';
import { EventApplicationPage } from './pages/EventApplicationPage';
import { RegistrationSuccessPage } from './pages/RegistrationSuccessPage';
import { RegistrationFormPage } from './pages/RegistrationFormPage';
import { ConsentScanPage } from './pages/ConsentScanPage';
import { ConsentFormsPage } from './pages/ConsentFormsPage';
import { ArtistConsentPage } from './pages/ArtistConsentPage';
import { ClientConsentPage } from './pages/ClientConsentPage';
import { ArtistBookingPage } from './pages/ArtistBookingPage';
import { ClientBookingPage } from './pages/ClientBookingPage';
import { ClientTicketsPage } from './pages/ClientTicketsPage';
import { TattScoreAdminPage } from './pages/TattScoreAdminPage';
import { TattScoreJudgingPage } from './pages/TattScoreJudgingPage';
import { StudioDashboardPage } from './pages/StudioDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminConsentTemplatesPage } from './pages/AdminConsentTemplatesPage';
import { AdminAftercareTemplatesPage } from './pages/AdminAftercareTemplatesPage';
import { TicketManagementPage } from './pages/TicketManagementPage';
import { EventSettingsPage } from './pages/EventSettingsPage';
import { AttendeeProfilePage } from './pages/AttendeeProfilePage';

// AppContent component that uses the useAuth hook
function AppContent() {
  const { user, isLoading } = useAuth();
  const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Set a timeout to help debug if loading gets stuck
    const timeout = setTimeout(() => {
      console.log('Loading timeout reached - still loading:', isLoading);
    }, 5000);
    
    setLoadingTimeout(timeout);
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={user ? <DashboardPage /> : <Navigate to="/login" />} />
          <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:eventSlug" element={<EventApplicationPage />} />
          <Route path="/messages" element={user ? <MessagesPage /> : <Navigate to="/login" />} />
          <Route path="/deals" element={user ? <DealsPage /> : <Navigate to="/login" />} />
          <Route path="/login" element={<RegistrationPage />} />
          <Route path="/registration-success" element={<RegistrationSuccessPage />} />
          <Route path="/registration/:token" element={<RegistrationFormPage />} />
          <Route path="/consent/scan/:code" element={<ConsentScanPage />} />
          <Route path="/consent-forms" element={user ? <ConsentFormsPage /> : <Navigate to="/login" />} />
          <Route path="/artist-consent" element={user ? <ArtistConsentPage /> : <Navigate to="/login" />} />
          <Route path="/client-consent" element={user ? <ClientConsentPage /> : <Navigate to="/login" />} />
          <Route path="/artist-booking" element={user ? <ArtistBookingPage /> : <Navigate to="/login" />} />
          <Route path="/client-booking" element={user ? <ClientBookingPage /> : <Navigate to="/login" />} />
          <Route path="/client-tickets" element={user ? <ClientTicketsPage /> : <Navigate to="/login" />} />
          <Route path="/tattscore/admin" element={user ? <TattScoreAdminPage /> : <Navigate to="/login" />} />
          <Route path="/tattscore/judging" element={user ? <TattScoreJudgingPage /> : <Navigate to="/login" />} />
          <Route path="/studio/dashboard" element={user ? <StudioDashboardPage /> : <Navigate to="/login" />} />
          <Route path="/admin/dashboard" element={user ? <AdminDashboardPage /> : <Navigate to="/login" />} />
          <Route path="/admin/users" element={user ? <AdminUsersPage /> : <Navigate to="/login" />} />
          <Route path="/admin/consent-templates" element={user ? <AdminConsentTemplatesPage /> : <Navigate to="/login" />} />
          <Route path="/admin/aftercare-templates" element={user ? <AdminAftercareTemplatesPage /> : <Navigate to="/login" />} />
          <Route path="/ticket-management" element={user ? <TicketManagementPage /> : <Navigate to="/login" />} />
          <Route path="/event-settings" element={user ? <EventSettingsPage /> : <Navigate to="/login" />} />
          <Route path="/attendee/:id" element={<AttendeeProfilePage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}