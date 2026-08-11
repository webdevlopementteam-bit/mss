import Footer from "./components/Footer";
import Header from "./components/Header";
import About from "./Pages/About";
import Contact from "./Pages/Contact";
import Home from "./Pages/Home";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PrivacyPolicy from "./Pages/PrivacyPolicy";
import TermsConditions from "./Pages/TermsConditions";
import ReturnPolicy from "./Pages/ReturnPolicy";
import Faq from "./Pages/Faq";
import Award from "./Pages/Award";
import Blog from "./Pages/Blog";
import Shop from "./Pages/Shop";
import SingleBlog from "./Pages/SingleBlog";
import Cart from "./Pages/Cart";
import Wishlist from "./Pages/Wishlist";
import Checkout from "./Pages/checkout";
import ProductDetails from "./Pages/ProductDetails";
import RecentlyViewed from "./Pages/Recentlyviewed";
import ProtectedRoute from "./components/ProtectedRoute";
import RequireProfileComplete from "./components/RequireProfileComplete";
import Login from "./Pages/Auth/Login";
import Signup from "./Pages/Auth/Signup";
import VerifyMobileOtp from "./Pages/Auth/VerifyMobileOtp";
import ForgotPassword from "./Pages/Auth/ForgotPassword";
import ResetPassword from "./Pages/Auth/ResetPassword";
import UserDashboardLayout from "./Pages/UserDashboard/Layout";
import OrdersView from "./Pages/UserDashboard/OrdersView";
import ProfileView from "./Pages/UserDashboard/ProfileView";
import OrderSuccess from "./Pages/OrderSuccess";


const App = () => {
  return (
    <>
      <BrowserRouter>
        <RequireProfileComplete>
          {/* min-h-screen + flex-col here, flex-1 on <main>, keeps Footer
              pinned to the bottom of the viewport even when a page's own
              content (e.g. Shop with few results) is shorter than the
              screen — instead of leaving a blank gap below the Footer. */}
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 flex flex-col">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-conditions" element={<TermsConditions />} />
                <Route path="/return-policy" element={<ReturnPolicy />} />
                <Route path="/faq" element={<Faq />} />
                <Route path="/award" element={<Award />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<SingleBlog />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/cart" element={<Cart/>}/>
                <Route path="/wishlist" element={<Wishlist/>}/>
                 <Route
                   path="/checkout"
                   element={
                     <ProtectedRoute>
                       <Checkout/>
                     </ProtectedRoute>
                   }
                 />
                 <Route path="/product/:id" element={<ProductDetails />} />
                 <Route path="/recently-viewed" element={<RecentlyViewed/>} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/verify-mobile-otp" element={<VerifyMobileOtp />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route
                  path="/order-success/:orderId"
                  element={
                    <ProtectedRoute>
                      <OrderSuccess />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user-dashboard"
                  element={
                    <ProtectedRoute>
                      <UserDashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<OrdersView />} />
                  <Route path="profile" element={<ProfileView />} />
                </Route>
              </Routes>
            </main>
            <Footer />
          </div>
        </RequireProfileComplete>
      </BrowserRouter>
    </>
  );
};

export default App;