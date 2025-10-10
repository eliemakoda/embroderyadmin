import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TutorialList from "./pages/tutorials/TutorialList";
import TutorialCreate from "./pages/tutorials/TutorialCreate";
import TutorialEdit from "./pages/tutorials/TutorialEdit";
import TutorialView from "./pages/tutorials/TutorialView";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import LoadingSpinner from "./components/ui/LoadingSpinner";
import Layout from "./components/layout/Layout";
import ProductList from "./pages/product/ProductList";
import ProductCreate from "./pages/product/ProductCreate";
import GalleryList from "./pages/gallery/GalleryList";
import CreateGallery from "./pages/gallery/CreateGallery";
import UpdateGallery from "./pages/gallery/UpdateGallery";
import CategoryList from "./pages/categories/CategoryList";
import CreateCategory from "./pages/categories/CreateCategory";
import Service from "./pages/services/Service";
import AddService from "./pages/services/AddService";
import TeamList from "./pages/Team/TeamList";
import UserList from "./pages/userList";
import ContactUs from "./pages/ContactUs";

function AppRoutes() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-100 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/admin/login"
        element={
          user ? (
            <Navigate to={location.state?.from || "/dashboard"} replace />
          ) : (
            <Login />
          )
        }
      />

      {/* Protected routes */}
      <Route
        element={
          user ? (
            <Layout />
          ) : (
            <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
          )
        }
      >
        <Route path="/admin/dashboard" element={<Dashboard />} index />
        <Route path="/admin/tutorials" element={<TutorialList />} />
        <Route path="/admin/tutorials/create" element={<TutorialCreate />} />
        <Route path="/admin/tutorials/:id/edit" element={<TutorialEdit />} />
        <Route path="/admin/tutorials/:id" element={<TutorialView />} />
        <Route path="/admin/products" element={<ProductList />} />
        <Route path="/admin/product/add" element={<ProductCreate />} />
        <Route path="/admin/gallery" element={<GalleryList />} />
        <Route path="/admin/admin/galleries/edit/:id" element={<UpdateGallery />} />
        <Route path="/admin/admin/galleries/add" element={<CreateGallery />} />
        <Route path="/admin/categories" element={<CategoryList />} />
        <Route path="/admin/services" element={<Service />} />
        <Route path="/admin/admin/services/new" element={<AddService />} />
        <Route path="/admin/admin/categories/new" element={<CreateCategory />} />
        <Route path="/admin/team" element={<TeamList />} />
        <Route path="/admin/users" element={<UserList />} />
        <Route path="/admin/contact-us" element={<ContactUs />} />
        <Route path="/admin/" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>

      {/* Catch-all route for invalid paths */}
      <Route
        path="/admin/*"
        element={
          user ? (
            <Navigate to="/admin/dashboard" replace />
          ) : (
            <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
          )
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="min-h-screen bg-background-100">
          <AppRoutes />
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;