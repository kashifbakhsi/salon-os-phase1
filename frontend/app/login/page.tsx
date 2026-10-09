"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirect = searchParams.get("redirect");

  const {
    login,
    user,
    isAuthenticated,
    loading: authLoading,
  } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /*
   * Decide where a logged-in user should go.
   */
  function getDefaultRoute(role?: string) {
    switch (role) {
      case "SALON_ADMIN":
        return "/owner/dashboard";

      case "STAFF":
        return "/staff/dashboard";

      case "SUPER_ADMIN":
        return "/admin";

      case "CUSTOMER":
      default:
        return "/";
    }
  }

  /*
   * If the user is already logged in,
   * send them to the correct application area.
   */
  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated || !user) {
      return;
    }

    /*
     * If a protected page requested a redirect,
     * respect it.
     *
     * Example:
     * /login?redirect=/appointments/123
     */
    if (redirect) {
      router.replace(redirect);
      return;
    }

    router.replace(getDefaultRoute(user.role));
  }, [
    authLoading,
    isAuthenticated,
    user,
    redirect,
    router,
  ]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      const loggedInUser = await login(
        identifier.trim(),
        password,
      );

      /*
       * If a page specifically requested login,
       * return there.
       *
       * Otherwise use role-based routing.
       */
      if (redirect) {
        router.replace(redirect);
      } else {
        router.replace(
          getDefaultRoute(loggedInUser.role),
        );
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to login",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">
            ✦
          </div>

          <h1>Welcome back</h1>

          <p>
            Sign in to manage your
            appointments.
          </p>
        </div>

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="auth-form"
        >
          <div className="form-group">
            <label>
              Email or phone
            </label>

            <input
              type="text"
              value={identifier}
              onChange={(event) =>
                setIdentifier(
                  event.target.value,
                )
              }
              placeholder="you@example.com"
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value,
                )
              }
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="primary-button full-width"
            disabled={submitting}
          >
            {submitting
              ? "Signing in..."
              : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          <span>
            Don't have an account?
          </span>

          <Link
            href={`/register${
              redirect
                ? `?redirect=${encodeURIComponent(
                    redirect,
                  )}`
                : ""
            }`}
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}