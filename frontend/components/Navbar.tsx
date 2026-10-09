"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const {
    user,
    loading,
    isAuthenticated,
    logout,
  } = useAuth();

  const { theme, toggleTheme } =
    useTheme();

  const router = useRouter();
  const pathname = usePathname();

  function handleLogout() {
    logout();

    if (
      pathname.startsWith(
        "/appointments",
      )
    ) {
      router.push("/");
    }
  }

  return (
    <header className="site-header">
      <div className="navbar-container">
        <Link
          href="/"
          className="brand"
        >
          <span className="brand-icon">
            ✦
          </span>

          <span>SalonOS</span>
        </Link>

        <nav className="navbar-links">
          <Link
            href="/"
            className="nav-link"
          >
            Explore
          </Link>

          {isAuthenticated && (
            <Link
              href="/appointments"
              className="nav-link"
            >
              My Appointments
            </Link>
          )}

          <button
            type="button"
            className="theme-button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {theme === "light"
              ? "☾"
              : "☀"}
          </button>

          {loading ? (
            <span className="nav-loading">
              ...
            </span>
          ) : isAuthenticated &&
            user ? (
            <div className="user-menu">
              <div className="user-avatar">
                {user.name
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="user-info">
                <strong>
                  {user.name}
                </strong>

                <span>
                  {user.role ===
                  "CUSTOMER"
                    ? "Customer"
                    : user.role}
                </span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="logout-button"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-links">
              <Link
                href="/login"
                className="login-button"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="register-button"
              >
                Get Started
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}