import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { InitialSetupPage } from './pages/InitialSetupPage';
import { DashboardPage } from './pages/DashboardPage';
import { EventsPage } from './pages/EventsPage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { RegistrationPage } from './pages/RegistrationPage';
import { RegistrationFormPage } from './pages/RegistrationFormPage';
import { RegistrationSuccessPage } from './pages/RegistrationSuccessPage';
import { MessagesPage } from './pages/MessagesPage';
import { DealsPage } from './pages/DealsPage';
import { EventApplicationPage } from './pages/EventApplicationPage';
import { EventSettingsPage } from './pages/EventSettingsPage';
import { AttendeeProfilePage } from './pages/AttendeeProfilePage';
import { RegistrationManagementPage } from './components/registration/RegistrationManagementPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ConsentFormsPage } from './pages/ConsentFormsPage';
import { ClientConsentPage } from './pages/ClientConsentPage';
import { ConsentPage } from './pages/ConsentPage';
import { ArtistConsentPage } from './pages/ArtistConsentPage';
import { ConsentScanPage } from './pages/ConsentScanPage';
import { ArtistBookingPage } from './pages/ArtistBookingPage';
import { ClientBookingPage } from './pages/ClientBookingPage';
import { TicketManagementPage } from './pages/TicketManagementPage';
import { ClientTicketsPage } from './pages/ClientTicketsPage';
import { TattScoreAdminPage } from './pages/TattScoreAdminPage';
import { TattScoreJudgingPage } from './pages/TattScoreJudgingPage';
import { StudioDashboardPage } from './pages/StudioDashboardPage';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, supabase } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we need to redirect to setup page
  useEffect(() => {
    const checkSetupNeeded = async () => {
      if (!isLoading && !user && location.pathname !== '/setup') {
        try {
          // Only check if we're not already on the setup page
          if (location.pathname !== '/setup') {
            if (supabase) {
              // Check if any admin users exist
              const { data, error } = await supabase
                .from('users')
                .select('id')
                .eq('role', 'admin')
                .limit(1);
                
              if (error) {
                console.error('Error checking for admin users:', error);
                return;
              }
              
              // If no admin users exist, redirect to setup
              if (!data || data.length === 0) {
                navigate('/setup');
                return;
              }
            }
          }
        } catch (error) {
          console.error('Error checking setup status:', error);
        }
      }
    };
    
    checkSetupNeeded();
  }, [isLoading, user, location.pathname, navigate, supabase]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/setup" element={<InitialSetupPage />} />
              <Route path="/login" element={<RegistrationPage />} />
              
              {/* Registration flow routes */}
              <Route path="/register/:token" element={<RegistrationFormPage />} />
              <Route path="/registration-success" element={<RegistrationSuccessPage />} />
              
              {/* Event application pages (public) */}
              <Route path="/:eventSlug" element={<EventApplicationPage />} />
              
              {/* Consent QR code scan route */}
              <Route path="/consent/scan/:code" element={<ConsentScanPage />} />
              
              {/* Protected routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/events" 
                element={
                  <ProtectedRoute>
                    <EventsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/applications" 
                element={
                  <ProtectedRoute>
                    <ApplicationsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/messages" 
                element={
                  <ProtectedRoute>
                    <MessagesPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/deals" 
                element={
                  <ProtectedRoute>
                    <DealsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/consent" 
                element={
                  <ProtectedRoute>
                    <ConsentPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/consent-forms" 
                element={
                  <ProtectedRoute>
                    <ConsentFormsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/client-consent" 
                element={
                  <ProtectedRoute>
                    <ClientConsentPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/artist-consent" 
                element={
                  <ProtectedRoute>
                    <ArtistConsentPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/artist-booking" 
                element={
                  <ProtectedRoute>
                    <ArtistBookingPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/client-booking" 
                element={
                  <ProtectedRoute>
                    <ClientBookingPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/ticket-management" 
                element={
                  <ProtectedRoute>
                    <TicketManagementPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-tickets" 
                element={
                  <ProtectedRoute>
                    <ClientTicketsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <EventSettingsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/attendee-profile" 
                element={
                  <ProtectedRoute>
                    <AttendeeProfilePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/registration-management" 
                element={
                  <ProtectedRoute>
                    <RegistrationManagementPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* TattScore Routes */}
              <Route 
                path="/tattscore/admin" 
                element={
                  <ProtectedRoute>
                    <TattScoreAdminPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/tattscore/judging" 
                element={
                  <ProtectedRoute>
                    <TattScoreJudgingPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Studio Routes */}
              <Route 
                path="/studio/dashboard" 
                element={
                  <ProtectedRoute>
                    <StudioDashboardPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Redirect old registration route to login */}
              <Route path="/registration" element={<Navigate to="/login" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;