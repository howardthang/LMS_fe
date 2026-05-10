import React from 'react';
import {
  Navigate,
  Route,
  HashRouter as Router,
  Routes,
  useLocation,
} from 'react-router-dom';
import { LibrarianLayout } from './components/librarian_pages/LibrarianLayout';
import { ErrorLayout } from './components/public_pages/ErrorLayout';
import { Layout } from './components/public_pages/Layout';
import { ScrollToTop } from './components/ScrollToTop';
import { ProtectedLayout } from './components/user_pages/Sidebar';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { UploadProvider } from './contexts/UploadContext';
import UploadPanel from './components/UploadPanel';
import { Toaster } from 'sonner';

// Public pages
import AboutPage from './pages/public_pages/AboutPage';
import BookDetailPage from './pages/public_pages/BookDetailPage';
import CategoriesPage from './pages/public_pages/CategoriesPage';
import ContactPage from './pages/public_pages/ContactPage';
import CookiePolicyPage from './pages/public_pages/CookiePolicyPage';
import FAQPage from './pages/public_pages/FAQPage';
import HomePage from './pages/public_pages/HomePage';
import LoginPage from './pages/public_pages/LoginPage';
import PrivacyPolicyPage from './pages/public_pages/PrivacyPolicyPage';
import RegisterPage from './pages/public_pages/RegisterPage';
import CheckEmailPage from './pages/public_pages/CheckEmailPage';
import VerificationSuccessPage from './pages/public_pages/VerificationSuccessPage';
import ForgotPasswordPage from './pages/public_pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/public_pages/ResetPasswordPage';
import OnboardingPage from './pages/public_pages/OnboardingPage';
import PublicSearchPage from './pages/public_pages/SearchPage';
import ServiceTermsPage from './pages/public_pages/ServiceTermsPage';
import TermsPage from './pages/public_pages/TermsPage';
import UserGuidePage from './pages/public_pages/UserGuidePage';
import OAuth2CallbackPage from './pages/public_pages/OAuth2CallbackPage';

// User pages
import DashboardPage from './pages/user_pages/DashboardPage';
import FinesPage from './pages/user_pages/FinesPage';
import MyBooksPage from './pages/user_pages/MyBooksPage';
import NotificationsPage from './pages/user_pages/NotificationsPage';
import ProfilePage from './pages/user_pages/ProfilePage';
import ReservationsPage from './pages/user_pages/ReservationsPage';
import UserSearchPage from './pages/user_pages/SearchPage';
import SettingsPage from './pages/user_pages/SettingsPage';
import WishlistPage from './pages/user_pages/WishlistPage';

// Librarian pages
import BookDetails from './pages/librarian_pages/BookDetails';
import BookList from './pages/librarian_pages/BookList';
import Circulation from './pages/librarian_pages/Circulation';
import CopyDetails from './pages/librarian_pages/CopyDetails';
import CopyList from './pages/librarian_pages/CopyList';
import LibrarianDashboard from './pages/librarian_pages/Dashboard';
import Notifications from './pages/librarian_pages/Notifications';
import Requests from './pages/librarian_pages/Requests';
import Settings from './pages/librarian_pages/Settings';
import TransactionList from './pages/librarian_pages/TransactionList';

// Error pages
import ForbiddenPage from './pages/error_pages/ForbiddenPage';
import MaintenancePage from './pages/error_pages/MaintenancePage';
import NotFoundPage from './pages/error_pages/NotFoundPage';

const PUBLIC_PREFIX = '/publicpage';
const USER_PREFIX = '/userpage';
const LIB_PREFIX = '/librarianpage';

// Protected Route Component
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedUserType: 'student' | 'librarian' | 'both';
}> = ({ children, allowedUserType }) => {
  const { userType } = useAuth();

  if (!userType) {
    return <Navigate to={`${PUBLIC_PREFIX}/login`} replace />;
  }

  if (allowedUserType !== 'both' && userType !== allowedUserType) {
    // Redirect to appropriate dashboard
    if (userType === 'student') {
      return <Navigate to={`${USER_PREFIX}/dashboard`} replace />;
    } else {
      return <Navigate to={`${LIB_PREFIX}/dashboard`} replace />;
    }
  }

  return <>{children}</>;
};

// Wrapper to conditionally render Layout
const AppContent = () => {
  // Bắt callback từ Google OAuth2 (Google redirect trực tiếp vào trình duyệt, không có dấu #)
  if (window.location.pathname === '/oauth2/callback') {
    return <OAuth2CallbackPage />;
  }

  const location = useLocation();
  const { userType } = useAuth();

  const legacyRedirects: Record<string, string> = {
    '/': `${PUBLIC_PREFIX}`,
    '/login': `${PUBLIC_PREFIX}/login`,
    '/register': `${PUBLIC_PREFIX}/register`,
    '/dashboard': `${USER_PREFIX}/dashboard`,
    '/search': `${USER_PREFIX}/search`,
    '/my-books': `${USER_PREFIX}/my-books`,
    '/reservations': `${USER_PREFIX}/reservations`,
    '/fines': `${USER_PREFIX}/fines`,
    '/profile': `${USER_PREFIX}/profile`,
    '/settings': `${USER_PREFIX}/settings`,
    '/wishlist': `${USER_PREFIX}/wishlist`,
    '/notifications': `${USER_PREFIX}/notifications`,
    '/librarian/dashboard': `${LIB_PREFIX}/dashboard`,
    '/librarian/circulation': `${LIB_PREFIX}/circulation`,
    '/librarian/books': `${LIB_PREFIX}/books`,
    '/librarian/copies': `${LIB_PREFIX}/copies`,
    '/librarian/requests': `${LIB_PREFIX}/requests`,
    '/librarian/settings': `${LIB_PREFIX}/settings`,
    '/librarian/notifications': `${LIB_PREFIX}/notifications`,
    '/librarian/transactions': `${LIB_PREFIX}/transactions`,
    '/about': `${PUBLIC_PREFIX}/about`,
    '/guide': `${PUBLIC_PREFIX}/guide`,
    '/faq': `${PUBLIC_PREFIX}/faq`,
    '/contact': `${PUBLIC_PREFIX}/contact`,
    '/terms': `${PUBLIC_PREFIX}/terms`,
    '/categories': `${PUBLIC_PREFIX}/categories`,
    '/privacy-policy': `${PUBLIC_PREFIX}/privacy-policy`,
    '/service-terms': `${PUBLIC_PREFIX}/service-terms`,
    '/cookie-policy': `${PUBLIC_PREFIX}/cookie-policy`,
  };

  if (legacyRedirects[location.pathname]) {
    return <Navigate to={legacyRedirects[location.pathname]} replace state={location.state} />;
  }

  // Handle dynamic nested routes (e.g., /librarian/books/1)
  if (location.pathname.startsWith('/librarian/')) {
    return <Navigate to={location.pathname.replace('/librarian/', `${LIB_PREFIX}/`)} replace state={location.state} />;
  }

  const isAuthPage =
    location.pathname === `${PUBLIC_PREFIX}/login` ||
    location.pathname === `${PUBLIC_PREFIX}/register` ||
    location.pathname === `${PUBLIC_PREFIX}/check-email` ||
    location.pathname === `${PUBLIC_PREFIX}/verify-success` ||
    location.pathname === `${PUBLIC_PREFIX}/forgot-password` ||
    location.pathname === `${PUBLIC_PREFIX}/reset-password` ||
    location.pathname === `${PUBLIC_PREFIX}/onboarding`;

  // List of paths that use the user protected layout
  const userProtectedPaths = [
    `${USER_PREFIX}/dashboard`,
    `${USER_PREFIX}/search`,
    `${USER_PREFIX}/book`,
    `${USER_PREFIX}/my-books`,
    `${USER_PREFIX}/reservations`,
    `${USER_PREFIX}/fines`,
    `${USER_PREFIX}/profile`,
    `${USER_PREFIX}/settings`,
    `${USER_PREFIX}/wishlist`,
    `${USER_PREFIX}/notifications`,
  ];
  const isUserProtectedPage = userProtectedPaths.some((path) =>
    location.pathname.startsWith(path)
  );

  // List of paths that use the librarian layout
  const librarianPaths = [
    `${LIB_PREFIX}/dashboard`,
    `${LIB_PREFIX}/circulation`,
    `${LIB_PREFIX}/books`,
    `${LIB_PREFIX}/copies`,
    `${LIB_PREFIX}/requests`,
    `${LIB_PREFIX}/settings`,
    `${LIB_PREFIX}/notifications`,
    `${LIB_PREFIX}/transactions`,
  ];
  const isLibrarianPage = librarianPaths.some((path) =>
    location.pathname.startsWith(path)
  );

  // List of error pages that use the error layout
  const errorPaths = ['/403', '/404', '/500'];
  const isErrorPage = errorPaths.includes(location.pathname);

  // Error pages (403, 404, 500) - separate layout with Header only
  if (isErrorPage) {
    return (
      <ErrorLayout>
        <Routes>
          <Route path="/403" element={<ForbiddenPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="/500" element={<MaintenancePage />} />
        </Routes>
      </ErrorLayout>
    );
  }

  // Redirect if logged in user tries to access auth pages
  if (isAuthPage && userType && location.pathname !== `${PUBLIC_PREFIX}/onboarding`) {
    if (userType === 'librarian') {
      return <Navigate to={`${LIB_PREFIX}/dashboard`} replace />;
    } else {
      return <Navigate to={`${USER_PREFIX}/dashboard`} replace />;
    }
  }

  // Auth pages (login, register, onboarding)
  if (isAuthPage) {
    return (
      <Routes>
        <Route path={`${PUBLIC_PREFIX}/login`} element={<LoginPage />} />
        <Route path={`${PUBLIC_PREFIX}/register`} element={<RegisterPage />} />
        <Route path={`${PUBLIC_PREFIX}/check-email`} element={<CheckEmailPage />} />
        <Route path={`${PUBLIC_PREFIX}/verify-success`} element={<VerificationSuccessPage />} />
        <Route path={`${PUBLIC_PREFIX}/forgot-password`} element={<ForgotPasswordPage />} />
        <Route path={`${PUBLIC_PREFIX}/reset-password`} element={<ResetPasswordPage />} />
        <Route path={`${PUBLIC_PREFIX}/onboarding`} element={<OnboardingPage />} />
      </Routes>
    );
  }

  // User protected pages
  if (isUserProtectedPage) {
    return (
      <ProtectedRoute allowedUserType="student">
        <ProtectedLayout>
          <Routes>
            <Route
              path={`${USER_PREFIX}/dashboard`}
              element={<DashboardPage />}
            />
            <Route
              path={`${USER_PREFIX}/search`}
              element={<UserSearchPage />}
            />
            <Route
              path={`${USER_PREFIX}/book/:id`}
              element={<BookDetailPage />}
            />
            <Route path={`${USER_PREFIX}/my-books`} element={<MyBooksPage />} />
            <Route
              path={`${USER_PREFIX}/reservations`}
              element={<ReservationsPage />}
            />
            <Route path={`${USER_PREFIX}/fines`} element={<FinesPage />} />
            <Route path={`${USER_PREFIX}/profile`} element={<ProfilePage />} />
            <Route
              path={`${USER_PREFIX}/settings`}
              element={<SettingsPage />}
            />
            <Route
              path={`${USER_PREFIX}/wishlist`}
              element={<WishlistPage />}
            />
            <Route
              path={`${USER_PREFIX}/notifications`}
              element={<NotificationsPage />}
            />
          </Routes>
        </ProtectedLayout>
      </ProtectedRoute>
    );
  }

  // Librarian pages
  if (isLibrarianPage) {
    return (
      <ProtectedRoute allowedUserType="librarian">
        <LibrarianLayout>
          <Routes>
            <Route
              path={`${LIB_PREFIX}/dashboard`}
              element={<LibrarianDashboard />}
            />
            <Route
              path={`${LIB_PREFIX}/circulation`}
              element={<Circulation />}
            />
            <Route path={`${LIB_PREFIX}/books`} element={<BookList />} />
            <Route path={`${LIB_PREFIX}/books/:id`} element={<BookDetails />} />
            <Route path={`${LIB_PREFIX}/copies`} element={<CopyList />} />
            <Route
              path={`${LIB_PREFIX}/copies/:id`}
              element={<CopyDetails />}
            />
            <Route path={`${LIB_PREFIX}/requests`} element={<Requests />} />
            <Route path={`${LIB_PREFIX}/settings`} element={<Settings />} />
            <Route
              path={`${LIB_PREFIX}/notifications`}
              element={<Notifications />}
            />
            <Route
              path={`${LIB_PREFIX}/transactions`}
              element={<TransactionList />}
            />
          </Routes>
        </LibrarianLayout>
      </ProtectedRoute>
    );
  }

  // Public pages
  return (
    <Layout>
      <Routes>
        <Route path={`${PUBLIC_PREFIX}`} element={<HomePage />} />
        <Route
          path={`${PUBLIC_PREFIX}/search`}
          element={<PublicSearchPage />}
        />
        <Route
          path={`${PUBLIC_PREFIX}/book/:id`}
          element={<BookDetailPage />}
        />
        <Route path={`${PUBLIC_PREFIX}/about`} element={<AboutPage />} />
        <Route path={`${PUBLIC_PREFIX}/guide`} element={<UserGuidePage />} />
        <Route path={`${PUBLIC_PREFIX}/faq`} element={<FAQPage />} />
        <Route path={`${PUBLIC_PREFIX}/contact`} element={<ContactPage />} />
        <Route path={`${PUBLIC_PREFIX}/terms`} element={<TermsPage />} />
        <Route
          path={`${PUBLIC_PREFIX}/categories`}
          element={<CategoriesPage />}
        />
        <Route
          path={`${PUBLIC_PREFIX}/privacy-policy`}
          element={<PrivacyPolicyPage />}
        />
        <Route
          path={`${PUBLIC_PREFIX}/service-terms`}
          element={<ServiceTermsPage />}
        />
        <Route
          path={`${PUBLIC_PREFIX}/cookie-policy`}
          element={<CookiePolicyPage />}
        />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <UploadProvider>
          <Router>
            <ScrollToTop />
            <AppContent />
          </Router>
          <Toaster position="bottom-right" richColors closeButton duration={5000} />
          <UploadPanel />
        </UploadProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
