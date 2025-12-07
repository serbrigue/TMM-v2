import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AdminProvider } from './context/AdminContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/cart/CartDrawer';
import ChatBot from './components/ChatBot';

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
const Products = lazy(() => import("./pages/Products"));
const Checkout = lazy(() => import("./pages/Checkout"));

// Detail Pages
const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const CourseViewer = lazy(() => import("./pages/CourseViewer"));
const WorkshopDetail = lazy(() => import("./pages/WorkshopDetail"));
const BlogPost = lazy(() => import("./pages/PostDetail")); // Alias for consistency
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const OrderDetail = lazy(() => import("./pages/OrderDetail"));

// Admin Pages
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminWorkshops = lazy(() => import("./pages/admin/Workshops"));
const AdminClients = lazy(() => import("./pages/admin/Clients"));
const ClientDetail = lazy(() => import("./pages/admin/ClientDetail"));
const AdminRevenue = lazy(() => import("./pages/admin/Revenue"));
const RevenueDetails = lazy(() => import("./pages/admin/RevenueDetails"));
const AdminCourses = lazy(() => import('./pages/admin/AdminCourses'));
const AdminBlog = lazy(() => import('./pages/admin/AdminBlog'));
const AdminMessages = lazy(() => import('./pages/admin/AdminMessages'));
const PaymentVerifier = lazy(() => import('./pages/admin/PaymentVerifier'));
const AdminWorkshopDetail = lazy(() => import('./pages/admin/AdminWorkshopDetail'));
const AdminCourseDetail = lazy(() => import('./pages/admin/AdminCourseDetail'));
const CreateCourse = lazy(() => import('./pages/admin/CreateCourse'));
const CreateWorkshop = lazy(() => import('./pages/admin/CreateWorkshop'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const CreateProduct = lazy(() => import('./pages/admin/CreateProduct'));

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tmm-black"></div>
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
      <AdminProvider>
        <CartProvider>
          <Router>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <CartDrawer />
              <ChatBot />
              <main className="flex-grow">
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/talleres" element={<Workshops />} />
                    <Route path="/talleres/:id" element={<WorkshopDetail />} />
                    <Route path="/cursos" element={<Courses />} />
                    <Route path="/cursos/:id" element={<CourseDetail />} />
                    <Route path="/cursos/:id/view" element={<ProtectedRoute><CourseViewer /></ProtectedRoute>} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:id" element={<BlogPost />} />
                    <Route path="/nosotros" element={<About />} />
                    <Route path="/contacto" element={<Contact />} />
                    <Route path="/calendario" element={<CalendarPage />} />
                    <Route path="/tienda" element={<Products />} />
                    <Route path="/tienda/:id" element={<ProductDetail />} />
                    <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />

                    {/* Auth Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } />
                    <Route path="/orders/:id" element={
                      <ProtectedRoute>
                        <OrderDetail />
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
                    <Route path="/admin/revenue/details" element={<AdminRoute><RevenueDetails /></AdminRoute>} />
                    <Route path="/admin/payments" element={<AdminRoute><PaymentVerifier /></AdminRoute>} />
                    <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
                    <Route path="/admin/products/create" element={<AdminRoute><CreateProduct /></AdminRoute>} />
                    <Route path="/admin/products/edit/:id" element={<AdminRoute><CreateProduct /></AdminRoute>} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
            </div>
          </Router>
        </CartProvider>
      </AdminProvider>
    </AuthProvider>
  );
};

export default App;
