import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import AdminLayout from "./layouts/AdminLayout";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Lazy load pages
const Home = lazy(() => import("./pages/Home"));
const Workshops = lazy(() => import("./pages/Workshops"));
const Courses = lazy(() => import("./pages/Courses"));
const About = lazy(() => import("./pages/About"));
const Blog = lazy(() => import("./pages/Blog"));
const Contact = lazy(() => import("./pages/Contact"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Profile = lazy(() => import("./pages/Profile"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));

// Detail Pages
const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const CourseViewer = lazy(() => import("./pages/CourseViewer"));
const WorkshopDetail = lazy(() => import("./pages/WorkshopDetail"));
const PostDetail = lazy(() => import("./pages/PostDetail"));

// Admin Pages
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminWorkshops = lazy(() => import("./pages/admin/Workshops"));
const AdminClients = lazy(() => import("./pages/admin/Clients"));
const ClientDetail = lazy(() => import("./pages/admin/ClientDetail"));
const AdminRevenue = lazy(() => import("./pages/admin/Revenue"));
const AdminCourses = lazy(() => import('./pages/admin/AdminCourses'));
const AdminBlog = lazy(() => import('./pages/admin/AdminBlog'));
const AdminMessages = lazy(() => import('./pages/admin/AdminMessages'));
const PaymentVerifier = lazy(() => import('./pages/admin/PaymentVerifier'));
const AdminWorkshopDetail = lazy(() => import('./pages/admin/AdminWorkshopDetail'));
const AdminCourseDetail = lazy(() => import('./pages/admin/AdminCourseDetail'));
const CreateCourse = lazy(() => import('./pages/admin/CreateCourse'));
const CreateWorkshop = lazy(() => import('./pages/admin/CreateWorkshop'));

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-calypso"></div>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" />;
  }

  return <AdminLayout>{children}</AdminLayout>;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<LoadingSpinner />}>
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
            <Route path="/admin/workshops/create" element={<AdminRoute><CreateWorkshop /></AdminRoute>} />
            <Route path="/admin/workshops/edit/:id" element={<AdminRoute><CreateWorkshop /></AdminRoute>} />
            <Route path="/admin/workshops/:id" element={<AdminRoute><AdminWorkshopDetail /></AdminRoute>} />
            <Route path="/admin/courses" element={<AdminRoute><AdminCourses /></AdminRoute>} />
            <Route path="/admin/courses/create" element={<AdminRoute><CreateCourse /></AdminRoute>} />
            <Route path="/admin/courses/edit/:id" element={<AdminRoute><CreateCourse /></AdminRoute>} />
            <Route path="/admin/courses/:id" element={<AdminRoute><AdminCourseDetail /></AdminRoute>} />
            <Route path="/admin/blog" element={<AdminRoute><AdminBlog /></AdminRoute>} />
            <Route path="/admin/clients" element={<AdminRoute><AdminClients /></AdminRoute>} />
            <Route path="/admin/clients/:id" element={<AdminRoute><ClientDetail /></AdminRoute>} />
            <Route path="/admin/messages" element={<AdminRoute><AdminMessages /></AdminRoute>} />
            <Route path="/admin/revenue" element={<AdminRoute><AdminRevenue /></AdminRoute>} />
            <Route path="/admin/payments" element={<AdminRoute><PaymentVerifier /></AdminRoute>} />

          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
};

export default App;
