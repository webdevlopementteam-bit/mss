import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import DashboardLayout from "./layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import "./styles/theme.css";
import ProtectedRoutes from "./routes/ProtectedRoutes";
import { AuthProvider } from "./context/AuthContext";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Brands from "./pages/Brands";
import Attributes from "./pages/Attributes";
import Coupons from "./pages/Coupons";
import Blog from "./pages/Blog";
import Client from "./pages/Client";
import Customers from "./pages/Customers";
import Ratings from "./pages/Ratings";
import Award from "./pages/Award";
import Pincode from "./pages/Pincode";
import CreateProduct from "./pages/CreateProduct";
import EditProduct from "./pages/EditProduct";
import { Toaster } from "react-hot-toast";
import StoreCustomization from "./pages/StoreCustomization";
import AdminOrders from "./pages/AdminOrders";
import AdminOrderDetails from "./pages/AdminOrderDetails";

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#111827",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)",
          },
        }}
      />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/"
              element={
                <ProtectedRoutes>
                  <DashboardLayout />
                </ProtectedRoutes>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="categories" element={<Categories />} />
              <Route path="brands" element={<Brands />} />
              <Route path="attributes" element={<Attributes />} />
              <Route path="pincode" element={<Pincode />} />
              <Route path="award" element={<Award />} />
              <Route path="coupons" element={<Coupons />} />
              <Route path="blog" element={<Blog />} />
              <Route path="client" element={<Client />} />
              <Route path="customers" element={<Customers />} />
              <Route path="ratings" element={<Ratings />} />
              <Route path="create-product" element={<CreateProduct />} />
              <Route path="edit-product/:id" element={<EditProduct />} />
              <Route
                path="/store-customization"
                element={<StoreCustomization />}
              />
              <Route path="/orders" element={<AdminOrders/>}/>
              <Route path="/orders/:id" element={<AdminOrderDetails/>}/>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}

export default App;
