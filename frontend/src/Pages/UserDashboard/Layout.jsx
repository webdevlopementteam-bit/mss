import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { C, Ico, I } from "./shared";

export default function UserDashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sideOpen, setSide] = useState(false);

  const isProfile = location.pathname.startsWith("/user-dashboard/profile");
  const firstName = user?.firstName || user?.name?.split(" ")[0] || "";
  const lastName = user?.lastName || user?.name?.split(" ")[1] || "";
  const initials =
    `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase() || "U";

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  const NavBtn = ({ to, label, icon, end }) => (
    <NavLink
      to={to}
      end={end}
      onClick={() => setSide(false)}
      style={({ isActive }) => ({
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        padding: "11px 14px",
        borderRadius: 10,
        border: "none",
        cursor: "pointer",
        background: isActive ? C.redLight : "transparent",
        color: isActive ? C.red : C.muted,
        textDecoration: "none",
        fontWeight: isActive ? 700 : 500,
        fontSize: 14,
        transition: "background .12s",
        marginBottom: 2,
      })}
    >
      {({ isActive }) => (
        <>
          <Ico d={icon} size={18} color={isActive ? C.red : C.subtle} />
          {label}
        </>
      )}
    </NavLink>
  );

  return (
    <div
      style={{
        fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
        background: C.bg,
        minHeight: "100vh",
        display: "flex",
      }}
    >
      {/* Mobile overlay */}
      {sideOpen && (
        <div
          onClick={() => setSide(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.4)",
            zIndex: 90,
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          width: 220,
          background: C.white,
          borderRight: `1px solid ${C.border}`,
          display: "flex",
          flexDirection: "column",
          padding: "18px 12px 20px",
          position: "sticky",
          top: 0,
          alignSelf: "flex-start",
          height: "100vh",
          flexShrink: 0,
          transition: "transform .22s",
        }}
        className={`sidebar-el${sideOpen ? " open" : ""}`}
      >
        {/* Avatar */}
        <div
          style={{
            background: C.redLight,
            borderRadius: 12,
            padding: "12px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 18,
            marginTop: 4,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: C.red,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span style={{ color: "#fff", fontSize: 14, fontWeight: 800 }}>
                {initials}
              </span>
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: C.text,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.name || `${firstName} ${lastName}`.trim()}
            </div>
            <div
              style={{
                fontSize: 11,
                color: C.muted,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.email}
            </div>
          </div>
        </div>

        <NavBtn to="/user-dashboard/profile" label="My Profile" icon={I.user} />
        <NavBtn to="/user-dashboard" end label="My Orders" icon={I.orders} />
        <div style={{ flex: 1 }} />
        <button
          onClick={handleSignOut}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "100%",
            padding: "11px 14px",
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
            background: "transparent",
            color: C.muted,
            fontWeight: 500,
            fontSize: 14,
          }}
        >
          <Ico d={I.logout} size={18} color={C.subtle} />
          Sign out
        </button>
      </aside>

      {/* Main */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
        className="main-area"
      >
        {/* Mobile bar */}
        <div
          className="mobile-bar"
          style={{
            display: "none",
            background: C.white,
            borderBottom: `1px solid ${C.border}`,
            padding: "0 16px",
            height: 56,
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 30,
          }}
        >
          <button
            onClick={() => setSide(true)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
            }}
          >
            <Ico d={I.menu} size={22} color={C.text} />
          </button>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>
            {isProfile ? "My Profile" : "My Orders"}
          </span>
          <div style={{ width: 30 }} />
        </div>

        <main style={{ flex: 1, padding: "32px 28px 56px", maxWidth: 800 }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        input, button { font-family: inherit; }
        @media (max-width: 700px) {
          .sidebar-el {
            position: fixed !important;
            top: 0 !important; bottom: 0 !important; left: 0 !important;
            height: 100vh !important;
            z-index: 95;
            transform: translateX(-100%);
          }
          .sidebar-el.open { transform: translateX(0) !important; }
          .main-area { margin-left: 0 !important; }
          .mobile-bar { display: flex !important; }
          main { padding: 20px 14px 56px !important; }
        }
      `}</style>
    </div>
  );
}
