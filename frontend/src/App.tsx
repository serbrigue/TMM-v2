import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import AdminLayout from "./layouts/AdminLayout";
import Home from "./pages/Home";
import Workshops from "./pages/Workshops";
import Courses from "./pages/Courses";
import About from "./pages/About";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminWorkshops from "./pages/admin/Workshops";
import AdminClients from "./pages/admin/Clients";
import ClientDetail from "./pages/admin/ClientDetail";
import AdminRevenue from "./pages/admin/Revenue";
import AdminCourses from './pages/admin/AdminCourses';
import AdminBlog from './pages/admin/AdminBlog';
import AdminMessages from './pages/admin/AdminMessages';
import PaymentVerifier from './pages/admin/PaymentVerifier';
import CourseDetail from './pages/CourseDetail';
import WorkshopDetail from './pages/WorkshopDetail';
import AdminWorkshopDetail from './pages/admin/AdminWorkshopDetail';
import AdminCourseDetail from './pages/admin/AdminCourseDetail';
import PostDetail from './pages/PostDetail';
import CourseViewer from './pages/CourseViewer';
import CalendarPage from './pages/CalendarPage';
import { AuthProvider, useAuth } from "./context/AuthContext";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Cargando...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) return <div>Cargando...</div>;

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" />;
  }

  return <AdminLayout>{children}</AdminLayout>;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/workshops" element={<Layout><Workshops /></Layout>} />
          <Route path="/courses" element={<Layout><Courses /></Layout>} />
          <Route path="/about" element={<Layout><About /></Layout>} />
          <Route path="/blog" element={<Layout><Blog /></Layout>} />
          <Route path="/contact" element={<Layout><Contact /></Layout>} />
          <Route path="/login" element={<Layout><Login /></Layout>} />
          <Route path="/register" element={<Layout><Register /></Layout>} />
          <Route path="/calendar" element={<Layout><CalendarPage /></Layout>} />

          {/* Detail Routes */}
          <Route path="/courses/:id" element={<Layout><CourseDetail /></Layout>} />
          <Route path="/courses/:id/view" element={<ProtectedRoute><CourseViewer /></ProtectedRoute>} />
          <Route path="/workshops/:id" element={<Layout><WorkshopDetail /></Layout>} />
          <Route path="/blog/:id" element={<Layout><PostDetail /></Layout>} />


          {/* Protected User Routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout><Profile /></Layout>
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/workshops" element={<AdminRoute><AdminWorkshops /></AdminRoute>} />
          <Route path="/admin/workshops/:id" element={<AdminRoute><AdminWorkshopDetail /></AdminRoute>} />
          <Route path="/admin/courses" element={<AdminRoute><AdminCourses /></AdminRoute>} />
          <Route path="/admin/courses/:id" element={<AdminRoute><AdminCourseDetail /></AdminRoute>} />
          <Route path="/admin/blog" element={<AdminRoute><AdminBlog /></AdminRoute>} />
          <Route path="/admin/clients" element={<AdminRoute><AdminClients /></AdminRoute>} />
          <Route path="/admin/clients/:id" element={<AdminRoute><ClientDetail /></AdminRoute>} />
          <Route path="/admin/messages" element={<AdminRoute><AdminMessages /></AdminRoute>} />
          <Route path="/admin/revenue" element={<AdminRoute><AdminRevenue /></AdminRoute>} />
          <Route path="/admin/payments" element={<AdminRoute><PaymentVerifier /></AdminRoute>} />

        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
