import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './components/layout/AuthProvider'
import { PublicLayout } from './components/layout/PublicLayout'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { AdminRoute } from './components/layout/AdminRoute'
import { AdminLayout } from './components/admin/AdminLayout'

// Public Pages
import { HomePage } from './pages/public/HomePage'
import { SearchPage } from './pages/public/SearchPage'
import { BuyPage } from './pages/public/BuyPage'
import { RentPage } from './pages/public/RentPage'
import { CommercialPage } from './pages/public/CommercialPage'
import { PlotsPage } from './pages/public/PlotsPage'
import { AgriculturalLandPage } from './pages/public/AgriculturalLandPage'
import { PropertyDetailPage } from './pages/public/PropertyDetailPage'
import { AllLocationsPage } from './pages/public/AllLocationsPage'
import { AboutPage } from './pages/public/AboutPage'
import { ContactPage } from './pages/public/ContactPage'
import { FAQsPage } from './pages/public/FAQsPage'
import { PrivacyPolicyPage } from './pages/public/PrivacyPolicyPage'
import { TermsPage } from './pages/public/TermsPage'
import { ListingGuidelinesPage } from './pages/public/ListingGuidelinesPage'
import { NotFoundPage } from './pages/public/NotFoundPage'
import { LoginPage } from './pages/public/LoginPage'
import { RegisterPage } from './pages/public/RegisterPage'
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage'

// User Pages
import { DashboardOverviewPage } from './pages/user/DashboardOverviewPage'
import { MyListingsPage } from './pages/user/MyListingsPage'
import { MyFavouritesPage } from './pages/user/MyFavouritesPage'
import { MyEnquiriesPage } from './pages/user/MyEnquiriesPage'
import { ProfilePage } from './pages/user/ProfilePage'
import { AccountSettingsPage } from './pages/user/AccountSettingsPage'
import { NotificationsPage } from './pages/user/NotificationsPage'
import { PostPropertyPage } from './pages/user/PostPropertyPage'
import { EditPropertyPage } from './pages/user/EditPropertyPage'

// Admin Pages
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage'
import { AdminPropertiesPage } from './pages/admin/AdminPropertiesPage'
import { AdminPropertyReviewPage } from './pages/admin/AdminPropertyReviewPage'
import { AdminAddPropertyPage } from './pages/admin/AdminAddPropertyPage'
import { AdminUsersPage } from './pages/admin/AdminUsersPage'
import { AdminEnquiriesPage } from './pages/admin/AdminEnquiriesPage'
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage'
import { AdminFAQsPage } from './pages/admin/AdminFAQsPage'
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage'
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Layout Routes (Header + Footer + ChatWidget) */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/buy" element={<BuyPage />} />
              <Route path="/rent" element={<RentPage />} />
              <Route path="/commercial" element={<CommercialPage />} />
              <Route path="/plots" element={<PlotsPage />} />
              <Route path="/agricultural-land" element={<AgriculturalLandPage />} />
              <Route path="/properties/:slug" element={<PropertyDetailPage />} />
              <Route path="/locations" element={<AllLocationsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/faqs" element={<FAQsPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/listing-guidelines" element={<ListingGuidelinesPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/post-property" element={<PostPropertyPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* User Dashboard Routes (Protected) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardOverviewPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/listings"
              element={
                <ProtectedRoute>
                  <MyListingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/add-property"
              element={
                <ProtectedRoute>
                  <PostPropertyPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/edit-property/:id"
              element={
                <ProtectedRoute>
                  <EditPropertyPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/favourites"
              element={
                <ProtectedRoute>
                  <MyFavouritesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/enquiries"
              element={
                <ProtectedRoute>
                  <MyEnquiriesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/settings"
              element={
                <ProtectedRoute>
                  <AccountSettingsPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Management Portal (Admin-protected) */}
            <Route
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route path="/admin" element={<AdminOverviewPage />} />
              <Route path="/admin/properties" element={<AdminPropertiesPage />} />
              <Route path="/admin/properties/pending" element={<AdminPropertiesPage initialFilter="pending_review" />} />
              <Route path="/admin/properties/approved" element={<AdminPropertiesPage initialFilter="approved" />} />
              <Route path="/admin/properties/rejected" element={<AdminPropertiesPage initialFilter="rejected" />} />
              <Route path="/admin/properties/suspended" element={<AdminPropertiesPage initialFilter="suspended" />} />
              <Route path="/admin/properties/add" element={<AdminAddPropertyPage />} />
              <Route path="/admin/properties/:id" element={<AdminPropertyReviewPage />} />
              <Route path="/admin/properties/:id/edit" element={<AdminAddPropertyPage editMode />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/enquiries" element={<AdminEnquiriesPage />} />
              <Route path="/admin/settings" element={<AdminSettingsPage />} />
              <Route path="/admin/faqs" element={<AdminFAQsPage />} />
              <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
              <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
            </Route>
          </Routes>

          {/* Global Toast Provider */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: '12px',
                border: '1px solid #EAEAEA',
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
              },
              success: {
                iconTheme: { primary: '#168653', secondary: '#fff' },
              },
              error: {
                iconTheme: { primary: '#D93636', secondary: '#fff' },
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
