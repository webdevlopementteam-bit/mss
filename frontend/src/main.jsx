import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ShopProvider } from './context/ShopContext.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from './context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
<GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
<AuthProvider>
<ShopProvider><App />
 <ToastContainer
    position="top-right"
    autoClose={2000}
    hideProgressBar={false}
    newestOnTop
    closeOnClick
    pauseOnHover
  />
</ShopProvider>
</AuthProvider>
</GoogleOAuthProvider>


)
