"use client";

import {
  FormEvent,
  useState,
} from "react";

import Link from "next/link";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import { useAuth } from "../../context/AuthContext";

type RegistrationType =
  | "CUSTOMER"
  | "SALON_OWNER";

function validatePassword(
  password: string,
): string | null {
  if (password.length < 8) {
    return "Password must contain at least 8 characters.";
  }

  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter.";
  }

  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter.";
  }

  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number.";
  }

  if (!/[@$!%*?&]/.test(password)) {
    return "Password must contain at least one special character.";
  }

  return null;
}

export default function RegisterPage() {
  const router = useRouter();

  const searchParams =
    useSearchParams();

  const redirect =
    searchParams.get("redirect") || "/";

  const {
    registerCustomer,
    registerSalonOwner,
  } = useAuth();

  const [registrationType, setRegistrationType] =
    useState<RegistrationType>("CUSTOMER");

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  // Salon owner fields

  const [salonName, setSalonName] =
    useState("");

  const [salonPhone, setSalonPhone] =
    useState("");

  const [salonEmail, setSalonEmail] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [city, setCity] =
    useState("");

  const [state, setState] =
    useState("");

  const [postalCode, setPostalCode] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [error, setError] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    // =========================================================
    // PASSWORD VALIDATION
    // =========================================================

    const passwordError =
      validatePassword(password);

    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (
      password !== confirmPassword
    ) {
      setError(
        "Passwords do not match.",
      );
      return;
    }

    // =========================================================
    // EMAIL / PHONE VALIDATION
    // =========================================================

    if (
      !email.trim() &&
      !phone.trim()
    ) {
      setError(
        "Please provide an email or phone number.",
      );
      return;
    }

    if (
      phone.trim() &&
      !/^[0-9]{10}$/.test(
        phone.trim(),
      )
    ) {
      setError(
        "Phone must contain exactly 10 digits.",
      );
      return;
    }

    // =========================================================
    // SALON OWNER VALIDATION
    // =========================================================

    if (
      registrationType ===
      "SALON_OWNER"
    ) {
      if (!salonName.trim()) {
        setError(
          "Salon name is required.",
        );
        return;
      }

      if (!address.trim()) {
        setError(
          "Salon address is required.",
        );
        return;
      }

      if (!city.trim()) {
        setError(
          "City is required.",
        );
        return;
      }

      if (!state.trim()) {
        setError(
          "State is required.",
        );
        return;
      }

      if (
        postalCode.trim() &&
        !/^[0-9]{6}$/.test(
          postalCode.trim(),
        )
      ) {
        setError(
          "PIN code must contain exactly 6 digits.",
        );
        return;
      }

      if (
        salonPhone.trim() &&
        !/^[0-9]{10}$/.test(
          salonPhone.trim(),
        )
      ) {
        setError(
          "Salon phone must contain exactly 10 digits.",
        );
        return;
      }
    }

    setSubmitting(true);

    try {
      if (
        registrationType ===
        "CUSTOMER"
      ) {
        await registerCustomer({
          name: name.trim(),
          email:
            email.trim() || undefined,
          phone:
            phone.trim() || undefined,
          password,
        });

        router.push(redirect);
      } else {
        await registerSalonOwner({
          ownerName: name.trim(),
          ownerEmail:
            email.trim() || undefined,
          ownerPhone:
            phone.trim() || undefined,
          password,

          salonName:
            salonName.trim(),

          salonPhone:
            salonPhone.trim() ||
            undefined,

          salonEmail:
            salonEmail.trim() ||
            undefined,

          address:
            address.trim(),

          city:
            city.trim(),

          state:
            state.trim(),

          postalCode:
            postalCode.trim() ||
            undefined,

          description:
            description.trim() ||
            undefined,
        });

        router.push(
          "/owner/dashboard",
        );
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create account",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const passwordRules = [
    {
      label: "At least 8 characters",
      valid: password.length >= 8,
    },
    {
      label: "One uppercase letter",
      valid: /[A-Z]/.test(password),
    },
    {
      label: "One lowercase letter",
      valid: /[a-z]/.test(password),
    },
    {
      label: "One number",
      valid: /[0-9]/.test(password),
    },
    {
      label: "One special character",
      valid: /[@$!%*?&]/.test(password),
    },
  ];

  return (
    <div className="auth-page">
      <div className="auth-card register-card">
        <div className="auth-header">
          <div className="auth-icon">
            ✦
          </div>

          <h1>
            {registrationType ===
            "CUSTOMER"
              ? "Create your account"
              : "Register your salon"}
          </h1>

          <p>
            {registrationType ===
            "CUSTOMER"
              ? "Join SalonOS and book your next appointment."
              : "Create your salon account and start managing your business."}
          </p>
        </div>

        {/* =====================================================
            REGISTRATION TYPE
        ====================================================== */}

        <div
          className="form-group"
          style={{
            marginBottom: "24px",
          }}
        >
          <label>
            Account type
          </label>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: "10px",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setRegistrationType(
                  "CUSTOMER",
                );
                setError("");
              }}
              style={{
                padding: "12px",
                borderRadius:
                  "10px",
                border:
                  registrationType ===
                  "CUSTOMER"
                    ? "2px solid currentColor"
                    : "1px solid #d1d5db",
                background:
                  registrationType ===
                  "CUSTOMER"
                    ? "rgba(0,0,0,0.04)"
                    : "transparent",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Customer
            </button>

            <button
              type="button"
              onClick={() => {
                setRegistrationType(
                  "SALON_OWNER",
                );
                setError("");
              }}
              style={{
                padding: "12px",
                borderRadius:
                  "10px",
                border:
                  registrationType ===
                  "SALON_OWNER"
                    ? "2px solid currentColor"
                    : "1px solid #d1d5db",
                background:
                  registrationType ===
                  "SALON_OWNER"
                    ? "rgba(0,0,0,0.04)"
                    : "transparent",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Salon Owner
            </button>
          </div>
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
          {/* ===================================================
              PERSONAL INFORMATION
          ==================================================== */}

          <div className="form-group">
            <label>
              {registrationType ===
              "SALON_OWNER"
                ? "Owner name"
                : "Full name"}
            </label>

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value,
                )
              }
              placeholder={
                registrationType ===
                "SALON_OWNER"
                  ? "Salon owner's full name"
                  : "Your name"
              }
              required
              minLength={2}
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label>
              Email
              <span className="optional">
                optional
              </span>
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value,
                )
              }
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label>
              Phone
              <span className="optional">
                optional
              </span>
            </label>

            <input
              type="tel"
              value={phone}
              onChange={(event) =>
                setPhone(
                  event.target.value.replace(
                    /\D/g,
                    "",
                  ),
                )
              }
              placeholder="9876543210"
              maxLength={10}
              autoComplete="tel"
            />
          </div>

          {/* ===================================================
              PASSWORD
          ==================================================== */}

          <div className="form-group">
            <label>
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value,
                )
              }
              placeholder="Create a strong password"
              minLength={8}
              required
              autoComplete="new-password"
            />

            {password.length > 0 && (
              <div
                style={{
                  marginTop: "10px",
                  fontSize: "13px",
                  lineHeight: "1.8",
                }}
              >
                {passwordRules.map(
                  (rule) => (
                    <div
                      key={rule.label}
                      style={{
                        color:
                          rule.valid
                            ? "green"
                            : "#777",
                      }}
                    >
                      {rule.valid
                        ? "✓"
                        : "○"}{" "}
                      {rule.label}
                    </div>
                  ),
                )}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>
              Confirm password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value,
                )
              }
              placeholder="Re-enter your password"
              minLength={8}
              required
              autoComplete="new-password"
            />
          </div>

          {/* ===================================================
              SALON INFORMATION
          ==================================================== */}

          {registrationType ===
            "SALON_OWNER" && (
            <>
              <div
                style={{
                  margin:
                    "18px 0 4px",
                  fontSize:
                    "18px",
                  fontWeight: 700,
                }}
              >
                Salon information
              </div>

              <div className="form-group">
                <label>
                  Salon name
                </label>

                <input
                  type="text"
                  value={salonName}
                  onChange={(
                    event,
                  ) =>
                    setSalonName(
                      event.target
                        .value,
                    )
                  }
                  placeholder="Your salon name"
                  required
                  minLength={2}
                />
              </div>

              <div className="form-group">
                <label>
                  Salon phone
                  <span className="optional">
                    optional
                  </span>
                </label>

                <input
                  type="tel"
                  value={
                    salonPhone
                  }
                  onChange={(
                    event,
                  ) =>
                    setSalonPhone(
                      event.target.value.replace(
                        /\D/g,
                        "",
                      ),
                    )
                  }
                  placeholder="9876543210"
                  maxLength={10}
                />
              </div>

              <div className="form-group">
                <label>
                  Salon email
                  <span className="optional">
                    optional
                  </span>
                </label>

                <input
                  type="email"
                  value={
                    salonEmail
                  }
                  onChange={(
                    event,
                  ) =>
                    setSalonEmail(
                      event.target
                        .value,
                    )
                  }
                  placeholder="salon@example.com"
                />
              </div>

              <div className="form-group">
                <label>
                  Address
                </label>

                <textarea
                  value={address}
                  onChange={(
                    event,
                  ) =>
                    setAddress(
                      event.target
                        .value,
                    )
                  }
                  placeholder="Complete salon address"
                  required
                  rows={3}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div className="form-group">
                  <label>
                    City
                  </label>

                  <input
                    type="text"
                    value={city}
                    onChange={(
                      event,
                    ) =>
                      setCity(
                        event.target
                          .value,
                      )
                    }
                    placeholder="Kolkata"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    State
                  </label>

                  <input
                    type="text"
                    value={state}
                    onChange={(
                      event,
                    ) =>
                      setState(
                        event.target
                          .value,
                      )
                    }
                    placeholder="West Bengal"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  PIN code
                  <span className="optional">
                    optional
                  </span>
                </label>

                <input
                  type="text"
                  value={
                    postalCode
                  }
                  onChange={(
                    event,
                  ) =>
                    setPostalCode(
                      event.target.value.replace(
                        /\D/g,
                        "",
                      ),
                    )
                  }
                  placeholder="700001"
                  maxLength={6}
                />
              </div>

              <div className="form-group">
                <label>
                  Salon description
                  <span className="optional">
                    optional
                  </span>
                </label>

                <textarea
                  value={
                    description
                  }
                  onChange={(
                    event,
                  ) =>
                    setDescription(
                      event.target
                        .value,
                    )
                  }
                  placeholder="Tell customers about your salon..."
                  rows={4}
                />
              </div>

              <div
                style={{
                  padding:
                    "12px 14px",
                  borderRadius:
                    "10px",
                  background:
                    "rgba(0,0,0,0.04)",
                  fontSize:
                    "13px",
                  lineHeight:
                    "1.6",
                }}
              >
                <strong>
                  Salon approval
                </strong>

                <br />

                Your salon will initially
                be submitted for approval.
                Once approved by SalonOS,
                it will become visible to
                customers.
              </div>
            </>
          )}

          <button
            type="submit"
            className="primary-button full-width"
            disabled={submitting}
          >
            {submitting
              ? "Creating account..."
              : registrationType ===
                "CUSTOMER"
              ? "Create Customer Account"
              : "Register Salon"}
          </button>
        </form>

        <div className="auth-footer">
          <span>
            Already have an account?
          </span>

          <Link
            href={`/login?redirect=${encodeURIComponent(
              redirect,
            )}`}
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}