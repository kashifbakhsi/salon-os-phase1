"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useSearchParams } from "next/navigation";

import { api } from "../../../../lib/api";
import { useAuth } from "../../../../context/AuthContext";

type AcceptInvitationResponse = {
  message: string;
  token: string;
  user: {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    role:
      | "CUSTOMER"
      | "SALON_ADMIN"
      | "STAFF"
      | "SUPER_ADMIN";
  };
};

export default function AcceptStaffInvitationPage() {
  const router = useRouter();

  const searchParams =
    useSearchParams();

  const { login } = useAuth();

  const [token, setToken] =
    useState("");

  const [name, setName] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    const invitationToken =
      searchParams.get("token");

    if (!invitationToken) {
      setError(
        "This staff invitation link is invalid because no invitation token was provided.",
      );

      setLoading(false);
      return;
    }

    setToken(invitationToken);
    setLoading(false);
  }, [searchParams]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!token) {
      setError(
        "Invalid invitation link.",
      );
      return;
    }

    if (!name.trim()) {
      setError(
        "Please enter your name.",
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must contain at least 8 characters.",
      );
      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      setError(
        "Passwords do not match.",
      );
      return;
    }

    try {
      setSubmitting(true);

      const response =
        await api<AcceptInvitationResponse>(
          "/auth/staff/accept-invitation",
          {
            method: "POST",
            body: JSON.stringify({
              token,
              name: name.trim(),
              password,
            }),
          },
        );

      /*
       * The backend already returns a JWT.
       *
       * We need to store it through the existing
       * AuthContext architecture.
       *
       * Since login() expects identifier/password,
       * we store the returned token directly here.
       */
      localStorage.setItem(
        "salonos_token",
        response.token,
      );

      setSuccess(
        "Your staff account has been created successfully.",
      );

      /*
       * Give the user a short confirmation before
       * moving to the staff dashboard.
       */
      setTimeout(() => {
        router.replace(
          "/staff/dashboard",
        );

        window.location.reload();
      }, 700);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to accept the staff invitation.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems:
            "center",
          justifyContent:
            "center",
          padding: "24px",
        }}
      >
        <p>
          Checking invitation...
        </p>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems:
          "center",
        justifyContent:
          "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
        }}
      >
        <div
          style={{
            marginBottom:
              "24px",
            textAlign:
              "center",
          }}
        >
          <Link
            href="/"
            style={{
              fontSize:
                "14px",
              textDecoration:
                "none",
              opacity: 0.7,
            }}
          >
            SalonOS
          </Link>

          <h1
            style={{
              margin:
                "12px 0 8px",
              fontSize:
                "30px",
            }}
          >
            Accept Staff Invitation
          </h1>

          <p
            style={{
              margin: 0,
              opacity: 0.7,
              lineHeight: 1.5,
            }}
          >
            Create your staff account
            and access your salon
            workspace.
          </p>
        </div>

        <div
          style={{
            padding: "26px",
            borderRadius:
              "16px",
            border:
              "1px solid rgba(128,128,128,.25)",
            background:
              "var(--card-bg, rgba(128,128,128,.06))",
          }}
        >
          {error && (
            <div
              style={{
                marginBottom:
                  "18px",
                padding:
                  "12px 14px",
                borderRadius:
                  "10px",
                border:
                  "1px solid #ef4444",
                background:
                  "rgba(239,68,68,.08)",
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                marginBottom:
                  "18px",
                padding:
                  "12px 14px",
                borderRadius:
                  "10px",
                border:
                  "1px solid #22c55e",
                background:
                  "rgba(34,197,94,.08)",
              }}
            >
              {success}
            </div>
          )}

          {!token ? (
            <div>
              <h2
                style={{
                  marginTop: 0,
                }}
              >
                Invalid Invitation
              </h2>

              <p
                style={{
                  opacity: 0.7,
                  lineHeight:
                    1.6,
                }}
              >
                The invitation link
                is missing its
                security token.
                Please ask the salon
                owner to send you a
                new invitation.
              </p>

              <Link
                href="/login"
                style={{
                  display:
                    "inline-block",
                  marginTop:
                    "10px",
                }}
              >
                Go to Login
              </Link>
            </div>
          ) : (
            <form
              onSubmit={
                handleSubmit
              }
            >
              <div
                style={
                  fieldGroupStyle
                }
              >
                <label
                  htmlFor="name"
                >
                  Full Name
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target
                        .value,
                    )
                  }
                  placeholder="Enter your full name"
                  autoComplete="name"
                  disabled={
                    submitting
                  }
                  style={
                    inputStyle
                  }
                />
              </div>

              <div
                style={
                  fieldGroupStyle
                }
              >
                <label
                  htmlFor="password"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target
                        .value,
                    )
                  }
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  disabled={
                    submitting
                  }
                  style={
                    inputStyle
                  }
                />
              </div>

              <div
                style={
                  fieldGroupStyle
                }
              >
                <label
                  htmlFor="confirmPassword"
                >
                  Confirm Password
                </label>

                <input
                  id="confirmPassword"
                  type="password"
                  value={
                    confirmPassword
                  }
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target
                        .value,
                    )
                  }
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  disabled={
                    submitting
                  }
                  style={
                    inputStyle
                  }
                />
              </div>

              <div
                style={{
                  margin:
                    "18px 0",
                  padding:
                    "12px 14px",
                  borderRadius:
                    "9px",
                  background:
                    "rgba(128,128,128,.08)",
                  fontSize:
                    "13px",
                  lineHeight:
                    1.5,
                  opacity: 0.75,
                }}
              >
                Your account will be
                created with the{" "}
                <strong>
                  STAFF
                </strong>{" "}
                role and associated
                with the salon that
                invited you.
              </div>

              <button
                type="submit"
                disabled={
                  submitting
                }
                style={{
                  width:
                    "100%",
                  border: "none",
                  borderRadius:
                    "9px",
                  padding:
                    "12px 16px",
                  cursor:
                    submitting
                      ? "not-allowed"
                      : "pointer",
                  background:
                    "var(--primary, #111827)",
                  color: "#fff",
                  fontWeight:
                    600,
                  opacity:
                    submitting
                      ? 0.7
                      : 1,
                }}
              >
                {submitting
                  ? "Creating Account..."
                  : "Create Staff Account"}
              </button>
            </form>
          )}
        </div>

        <p
          style={{
            textAlign:
              "center",
            marginTop:
              "20px",
            fontSize:
              "14px",
            opacity: 0.7,
          }}
        >
          Already have an account?{" "}
          <Link href="/login">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}

const fieldGroupStyle: React.CSSProperties =
  {
    display: "flex",
    flexDirection:
      "column",
    gap: "7px",
    marginBottom:
      "16px",
  };

const inputStyle: React.CSSProperties =
  {
    width: "100%",
    boxSizing:
      "border-box",
    padding:
      "11px 12px",
    borderRadius:
      "9px",
    border:
      "1px solid rgba(128,128,128,.35)",
    background:
      "var(--background, #fff)",
    color:
      "var(--foreground, inherit)",
    fontSize:
      "14px",
  };