import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/litix/ProtectedRoute";
import HomePage from "@/pages/Home";
import CoursesPage from "@/pages/Courses";
import CourseDetailPage from "@/pages/CourseDetail";
import ContactPage from "@/pages/Contact";
import AdminLoginPage from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import MercantileFreeLanding from "@/pages/MercantileFreeLanding";
import MercantileThanks from "@/pages/MercantileThanks";

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" richColors />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/cursos" element={<CoursesPage />} />
            <Route path="/cursos/:slug" element={<CourseDetailPage />} />
            <Route path="/contacto" element={<ContactPage />} />
            <Route path="/litigio-mercantil-gratis" element={<MercantileFreeLanding />} />
            <Route path="/gracias-litigio-mercantil" element={<MercantileThanks />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
