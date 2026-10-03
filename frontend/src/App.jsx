import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ThemeToggle from './components/ThemeToggle';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CodeReview from './pages/CodeReview';
import GitHubIntegration from './pages/GitHubIntegration';
import ProjectUpload from './pages/ProjectUpload';
import CollaborationRoom from './pages/CollaborationRoom';
import Bookmarks from './pages/Bookmarks';
import InterviewPrep from './pages/InterviewPrep';
import Roadmap from './pages/Roadmap';
import ChatAssistant from './pages/ChatAssistant';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import ProtectedRoute from './components/auth/ProtectedRoute';

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.body.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    const rafId = requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });
    return () => cancelAnimationFrame(rafId);
  }, [pathname]);

  return null;
};

const PageWrapper = ({ children }) => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
          <Route path="/code-review" element={<PageWrapper><CodeReview /></PageWrapper>} />
          <Route path="/github" element={<PageWrapper><GitHubIntegration /></PageWrapper>} />
          <Route path="/upload" element={<PageWrapper><ProjectUpload /></PageWrapper>} />
          <Route path="/collab/:roomId" element={<PageWrapper><CollaborationRoom /></PageWrapper>} />
          <Route path="/bookmarks" element={<PageWrapper><Bookmarks /></PageWrapper>} />
          <Route path="/interview" element={<PageWrapper><InterviewPrep /></PageWrapper>} />
          <Route path="/roadmap" element={<PageWrapper><Roadmap /></PageWrapper>} />
          <Route path="/chat" element={<PageWrapper><ChatAssistant /></PageWrapper>} />
          <Route path="/admin" element={<PageWrapper><AdminDashboard /></PageWrapper>} />
          <Route path="/profile" element={<PageWrapper><Profile /></PageWrapper>} />
          {/* Other protected routes will go here */}
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <ScrollToTop />
            <div className="flex flex-col min-h-screen w-full">
              <Navbar />
              <div className="flex-grow">
                <AnimatedRoutes />
              </div>
              <Footer />
              <ThemeToggle />
            </div>
          </Router>
          <ToastContainer position="bottom-right" theme="colored" />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
