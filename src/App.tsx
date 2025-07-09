import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { EventsPage } from './pages/EventsPage';
import { EventApplicationPage } from './pages/EventApplicationPage';
import { RegistrationPage } from './pages/RegistrationPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { RegistrationFormPage } from './pages/RegistrationFormPage';
import { RegistrationSuccessPage } from './pages/RegistrationSuccessPage';
import { ProfilePage } from './pages/ProfilePage';
import { MessagesPage } from './pages/MessagesPage';
import { DealsPage } from './pages/DealsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { TicketManagementPage } from './pages/TicketManagementPage';
import { ClientTicketsPage } from './pages/ClientTicketsPage';
import { ConsentFormsPage } from './pages/ConsentFormsPage';
import { ConsentScanPage } from './pages/ConsentScanPage';
import { ArtistConsentPage } from './pages/ArtistConsentPage';
import { ClientConsentPage } from './pages/ClientConsentPage';
import { ArtistBookingPage } from './pages/ArtistBookingPage';
import { ClientBookingPage } from './pages/ClientBookingPage';
import { TattScoreAdminPage } from './pages/TattScoreAdminPage';
import { TattScoreJudgingPage } from './pages/TattScoreJudgingPage';
import { StudioDashboardPage } from './pages/StudioDashboardPage';
import { EventSettingsPage } from './pages/EventSettingsPage';
import { AttendeeProfilePage } from './pages/AttendeeProfilePage';

function AppContent() {
  const { user } = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-slate-900 text-white flex flex-col">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={user ? <DashboardPage /> : <HomePage />} />
            <Route path="/dashboard" element={user?.role === 'admin' ? <AdminDashboardPage /> : <DashboardPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:eventSlug" element={<EventApplicationPage />} />
            <Route path="/login" element={<RegistrationPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/register/:token" element={<RegistrationFormPage />} />
            <Route path="/registration-success" element={<RegistrationSuccessPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/deals" element={<DealsPage />} />
            <Route path="/ticket-management" element={<TicketManagementPage />} />
            <Route path="/tickets" element={<ClientTicketsPage />} />
            <Route path="/consent-forms" element={<ConsentFormsPage />} />
            <Route path="/consent/:code" element={<ConsentScanPage />} />
            <Route path="/artist-consent" element={<ArtistConsentPage />} />
            <Route path="/client-consent" element={<ClientConsentPage />} />
            <Route path="/artist-booking" element={<ArtistBookingPage />} />
            <Route path="/client-booking" element={<ClientBookingPage />} />
            <Route path="/tattscore/admin" element={<TattScoreAdminPage />} />
            <Route path="/tattscore/judging" element={<TattScoreJudgingPage />} />
            <Route path="/studio/dashboard" element={<StudioDashboardPage />} />
            <Route path="/event-settings" element={<EventSettingsPage />} />
            <Route path="/attendee-profile" element={<AttendeeProfilePage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;