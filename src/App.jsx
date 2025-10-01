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
        path="/login"
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
            <Navigate to="/login" replace state={{ from: location.pathname }} />
          )
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tutorials" element={<TutorialList />} />
        <Route path="/tutorials/create" element={<TutorialCreate />} />
        <Route path="/tutorials/:id/edit" element={<TutorialEdit />} />
        <Route path="/tutorials/:id" element={<TutorialView />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/product/add" element={<ProductCreate />} />
        <Route path="/gallery" element={<GalleryList />} />
        <Route path="/admin/galleries/edit/:id" element={<UpdateGallery />} />
        <Route path="/admin/galleries/add" element={<CreateGallery />} />
        <Route path="/categories" element={<CategoryList />} />
        <Route path="/services" element={<Service />} />
        <Route path="/admin/services/new" element={<AddService />} />
        <Route path="/admin/categories/new" element={<CreateCategory />} />
        <Route path="/team" element={<TeamList />} />
        <Route path="/users" element={<UserList />} />
        <Route path="/contact-us" element={<ContactUs />} />
        {/* Root path redirects to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Route>

      {/* Catch-all route for invalid paths */}
      <Route
        path="*"
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace state={{ from: location.pathname }} />
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