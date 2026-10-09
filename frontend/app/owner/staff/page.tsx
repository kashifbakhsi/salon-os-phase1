"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "../../../context/AuthContext";
import {
  createOwnerStaff,
  createStaffInvitation,
  deactivateOwnerStaff,
  getOwnerServices,
  getOwnerStaff,
  updateOwnerStaff,
  type CreateOwnerStaffData,
  type OwnerService,
  type OwnerStaff,
} from "../../../lib/api";

export default function OwnerStaffPage() {
  const router = useRouter();

  const {
    user,
    token,
    loading: authLoading,
  } = useAuth();

  const [staff, setStaff] = useState<
    OwnerStaff[]
  >([]);

  const [services, setServices] = useState<
    OwnerService[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [editingStaff, setEditingStaff] =
    useState<OwnerStaff | null>(null);

  const [showInvite, setShowInvite] =
    useState(false);

  const [invitationUrl, setInvitationUrl] =
    useState("");

  const [form, setForm] =
    useState<CreateOwnerStaffData>({
      displayName: "",
      email: "",
      phone: "",
      bio: "",
      specialization: "",
      experienceYears: 0,
      serviceIds: [],
    });

  const [inviteForm, setInviteForm] =
    useState({
      email: "",
      phone: "",
    });

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user || !token) {
      router.replace(
        "/login?redirect=/owner/staff",
      );
      return;
    }

    if (user.role !== "SALON_ADMIN") {
      router.replace("/");
      return;
    }

    loadData();
  }, [
    authLoading,
    user,
    token,
    router,
  ]);

  async function loadData() {
    if (!token) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [
        staffData,
        serviceData,
      ] = await Promise.all([
        getOwnerStaff(token),
        getOwnerServices(token),
      ]);

      setStaff(staffData);
      setServices(
        serviceData.filter(
          (service) =>
            service.active,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load staff.",
      );
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({
      displayName: "",
      email: "",
      phone: "",
      bio: "",
      specialization: "",
      experienceYears: 0,
      serviceIds: [],
    });

    setEditingStaff(null);
  }

  function openAddForm() {
    resetForm();
    setShowForm(true);
    setSuccess("");
    setError("");
  }

  function openEditForm(
    member: OwnerStaff,
  ) {
    setEditingStaff(member);

    setForm({
      displayName:
        member.displayName,
      email:
        member.user.email ?? "",
      phone:
        member.user.phone ?? "",
      bio:
        member.bio ?? "",
      specialization:
        member.specialization ?? "",
      experienceYears:
        member.experienceYears ?? 0,
      serviceIds:
        member.services.map(
          (item) =>
            item.service.id,
        ),
    });

    setShowForm(true);
    setSuccess("");
    setError("");
  }

  function closeForm() {
    if (saving) {
      return;
    }

    setShowForm(false);
    resetForm();
  }

  function toggleService(
    serviceId: string,
  ) {
    setForm((current) => {
      const currentIds =
        current.serviceIds ?? [];

      const exists =
        currentIds.includes(
          serviceId,
        );

      return {
        ...current,
        serviceIds: exists
          ? currentIds.filter(
              (id) =>
                id !== serviceId,
            )
          : [
              ...currentIds,
              serviceId,
            ],
      };
    });
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!token) {
      return;
    }

    setError("");
    setSuccess("");

    if (!form.displayName.trim()) {
      setError(
        "Staff name is required.",
      );
      return;
    }

    if (!form.email?.trim() &&
        !form.phone?.trim()) {
      setError(
        "Staff email or phone is required.",
      );
      return;
    }

    try {
      setSaving(true);

      if (editingStaff) {
        const updated =
          await updateOwnerStaff(
            token,
            editingStaff.id,
            {
              displayName:
                form.displayName.trim(),

              email:
                form.email?.trim() ||
                undefined,

              phone:
                form.phone?.trim() ||
                undefined,

              bio:
                form.bio?.trim() ||
                undefined,

              specialization:
                form.specialization?.trim() ||
                undefined,

              experienceYears:
                Number(
                  form.experienceYears,
                ),

              serviceIds:
                form.serviceIds ?? [],
            },
          );

        setStaff((current) =>
          current.map((item) =>
            item.id ===
            editingStaff.id
              ? updated
              : item,
          ),
        );

        setSuccess(
          "Staff member updated successfully.",
        );
      } else {
        const created =
          await createOwnerStaff(
            token,
            {
              displayName:
                form.displayName.trim(),

              email:
                form.email?.trim() ||
                undefined,

              phone:
                form.phone?.trim() ||
                undefined,

              bio:
                form.bio?.trim() ||
                undefined,

              specialization:
                form.specialization?.trim() ||
                undefined,

              experienceYears:
                Number(
                  form.experienceYears,
                ),

              serviceIds:
                form.serviceIds ?? [],
            },
          );

        setStaff((current) => [
          ...current,
          created,
        ]);

        setSuccess(
          "Staff member added successfully.",
        );
      }

      setShowForm(false);
      resetForm();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save staff member.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(
    member: OwnerStaff,
  ) {
    if (!token) {
      return;
    }

    const confirmed =
      window.confirm(
        `Deactivate ${member.displayName}?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const updated =
        await deactivateOwnerStaff(
          token,
          member.id,
        );

      setStaff((current) =>
        current.map((item) =>
          item.id === member.id
            ? {
                ...item,
                active:
                  updated.active,
              }
            : item,
        ),
      );

      setSuccess(
        `${member.displayName} has been deactivated.`,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to deactivate staff.",
      );
    }
  }

  async function handleActivate(
    member: OwnerStaff,
  ) {
    if (!token) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const updated =
        await updateOwnerStaff(
          token,
          member.id,
          {
            active: true,
          },
        );

      setStaff((current) =>
        current.map((item) =>
          item.id === member.id
            ? {
                ...item,
                active:
                  updated.active,
              }
            : item,
        ),
      );

      setSuccess(
        `${member.displayName} is active again.`,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to activate staff.",
      );
    }
  }

  async function handleInvite(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!token) {
      return;
    }

    setError("");
    setSuccess("");
    setInvitationUrl("");

    if (
      !inviteForm.email.trim() &&
      !inviteForm.phone.trim()
    ) {
      setError(
        "Enter an email address or phone number.",
      );
      return;
    }

    try {
      setSaving(true);

      const result =
        await createStaffInvitation(
          token,
          {
            email:
              inviteForm.email.trim() ||
              undefined,

            phone:
              inviteForm.phone.trim() ||
              undefined,
          },
        );

      setInvitationUrl(
        result.invitationUrl,
      );

      setSuccess(
        "Staff invitation created successfully.",
      );

      setInviteForm({
        email: "",
        phone: "",
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create invitation.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (
    authLoading ||
    loading
  ) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: "40px",
        }}
      >
        <p>Loading staff...</p>
      </main>
    );
  }

  if (
    !user ||
    user.role !== "SALON_ADMIN"
  ) {
    return null;
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "32px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Header */}

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "16px",
            marginBottom: "28px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <Link
              href="/owner/dashboard"
              style={{
                textDecoration:
                  "none",
                opacity: 0.75,
              }}
            >
              ← Owner Dashboard
            </Link>

            <h1
              style={{
                margin:
                  "10px 0 6px",
                fontSize: "32px",
              }}
            >
              Staff Management
            </h1>

            <p
              style={{
                margin: 0,
                opacity: 0.7,
              }}
            >
              Manage your salon team,
              services and staff access.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={() =>
                setShowInvite(true)
              }
              style={primaryButtonStyle}
            >
              Invite Staff
            </button>

            <button
              type="button"
              onClick={openAddForm}
              style={secondaryButtonStyle}
            >
              + Add Staff
            </button>
          </div>
        </div>

        {/* Messages */}

        {error && (
          <div
            style={{
              ...messageStyle,
              border:
                "1px solid #ef4444",
              marginBottom: "18px",
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              ...messageStyle,
              border:
                "1px solid #22c55e",
              marginBottom: "18px",
            }}
          >
            {success}
          </div>
        )}

        {/* Staff count */}

        <div
          style={{
            marginBottom: "18px",
            opacity: 0.75,
          }}
        >
          {staff.length} staff member
          {staff.length === 1
            ? ""
            : "s"}
        </div>

        {/* Staff list */}

        {staff.length === 0 ? (
          <div
            style={cardStyle}
          >
            <h2
              style={{
                marginTop: 0,
              }}
            >
              No staff members yet
            </h2>

            <p
              style={{
                opacity: 0.7,
              }}
            >
              Add your first staff member
              or send an invitation.
            </p>

            <button
              type="button"
              onClick={openAddForm}
              style={primaryButtonStyle}
            >
              Add Staff
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "18px",
            }}
          >
            {staff.map((member) => (
              <div
                key={member.id}
                style={{
                  ...cardStyle,
                  opacity:
                    member.active
                      ? 1
                      : 0.65,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    gap: "12px",
                  }}
                >
                  <div>
                    <h2
                      style={{
                        margin:
                          "0 0 6px",
                        fontSize:
                          "21px",
                      }}
                    >
                      {
                        member.displayName
                      }
                    </h2>

                    <p
                      style={{
                        margin:
                          "0 0 4px",
                        opacity: 0.7,
                      }}
                    >
                      {
                        member.specialization ||
                        "Staff Member"
                      }
                    </p>

                    <p
                      style={{
                        margin: 0,
                        fontSize:
                          "14px",
                        opacity: 0.65,
                      }}
                    >
                      {
                        member.experienceYears
                      }{" "}
                      year
                      {member.experienceYears ===
                      1
                        ? ""
                        : "s"}{" "}
                      experience
                    </p>
                  </div>

                  <span
                    style={{
                      ...statusStyle,
                      background:
                        member.active
                          ? "rgba(34,197,94,.12)"
                          : "rgba(239,68,68,.12)",
                      borderColor:
                        member.active
                          ? "#22c55e"
                          : "#ef4444",
                    }}
                  >
                    {member.active
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>

                <div
                  style={{
                    marginTop:
                      "18px",
                    fontSize:
                      "14px",
                    lineHeight: 1.7,
                  }}
                >
                  <div>
                    <strong>
                      Email:
                    </strong>{" "}
                    {member.user
                      .email ||
                      "Not provided"}
                  </div>

                  <div>
                    <strong>
                      Phone:
                    </strong>{" "}
                    {member.user
                      .phone ||
                      "Not provided"}
                  </div>
                </div>

                <div
                  style={{
                    marginTop:
                      "16px",
                  }}
                >
                  <strong
                    style={{
                      fontSize:
                        "14px",
                    }}
                  >
                    Services
                  </strong>

                  <div
                    style={{
                      display:
                        "flex",
                      flexWrap:
                        "wrap",
                      gap: "7px",
                      marginTop:
                        "8px",
                    }}
                  >
                    {member.services
                      .length > 0 ? (
                      member.services.map(
                        ({
                          service,
                        }) => (
                          <span
                            key={
                              service.id
                            }
                            style={
                              tagStyle
                            }
                          >
                            {
                              service.name
                            }
                          </span>
                        ),
                      )
                    ) : (
                      <span
                        style={{
                          opacity: 0.6,
                          fontSize:
                            "13px",
                        }}
                      >
                        No services assigned
                      </span>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display:
                      "flex",
                    gap: "8px",
                    marginTop:
                      "20px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      openEditForm(
                        member,
                      )
                    }
                    style={
                      secondaryButtonStyle
                    }
                  >
                    Edit
                  </button>

                  {member.active ? (
                    <button
                      type="button"
                      onClick={() =>
                        handleDeactivate(
                          member,
                        )
                      }
                      style={
                        dangerButtonStyle
                      }
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        handleActivate(
                          member,
                        )
                      }
                      style={
                        secondaryButtonStyle
                      }
                    >
                      Activate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit modal */}

        {showForm && (
          <div
            style={overlayStyle}
          >
            <div
              style={modalStyle}
            >
              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center",
                  marginBottom:
                    "20px",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                  }}
                >
                  {editingStaff
                    ? "Edit Staff"
                    : "Add Staff"}
                </h2>

                <button
                  type="button"
                  onClick={
                    closeForm
                  }
                  style={
                    closeButtonStyle
                  }
                >
                  ×
                </button>
              </div>

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
                  <label>
                    Staff Name *
                  </label>

                  <input
                    value={
                      form.displayName
                    }
                    onChange={(event) =>
                      setForm(
                        (
                          current,
                        ) => ({
                          ...current,
                          displayName:
                            event
                              .target
                              .value,
                        }),
                      )
                    }
                    placeholder="Rahul Kumar"
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
                  <label>
                    Email
                  </label>

                  <input
                    type="email"
                    value={
                      form.email
                    }
                    onChange={(event) =>
                      setForm(
                        (
                          current,
                        ) => ({
                          ...current,
                          email:
                            event
                              .target
                              .value,
                        }),
                      )
                    }
                    placeholder="rahul@example.com"
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
                  <label>
                    Phone
                  </label>

                  <input
                    value={
                      form.phone
                    }
                    onChange={(event) =>
                      setForm(
                        (
                          current,
                        ) => ({
                          ...current,
                          phone:
                            event
                              .target
                              .value,
                        }),
                      )
                    }
                    placeholder="9876543210"
                    style={
                      inputStyle
                    }
                  />
                </div>

                <div
                  style={{
                    display:
                      "grid",
                    gridTemplateColumns:
                      "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  <div
                    style={
                      fieldGroupStyle
                    }
                  >
                    <label>
                      Specialization
                    </label>

                    <input
                      value={
                        form.specialization
                      }
                      onChange={(
                        event,
                      ) =>
                        setForm(
                          (
                            current,
                          ) => ({
                            ...current,
                            specialization:
                              event
                                .target
                                .value,
                          }),
                        )
                      }
                      placeholder="Hair Specialist"
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
                    <label>
                      Experience
                      (years)
                    </label>

                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={
                        form.experienceYears
                      }
                      onChange={(
                        event,
                      ) =>
                        setForm(
                          (
                            current,
                          ) => ({
                            ...current,
                            experienceYears:
                              Number(
                                event
                                  .target
                                  .value,
                              ),
                          }),
                        )
                      }
                      style={
                        inputStyle
                      }
                    />
                  </div>
                </div>

                <div
                  style={
                    fieldGroupStyle
                  }
                >
                  <label>
                    Bio
                  </label>

                  <textarea
                    value={
                      form.bio
                    }
                    onChange={(event) =>
                      setForm(
                        (
                          current,
                        ) => ({
                          ...current,
                          bio:
                            event
                              .target
                              .value,
                        }),
                      )
                    }
                    rows={3}
                    placeholder="Short professional description"
                    style={{
                      ...inputStyle,
                      resize:
                        "vertical",
                    }}
                  />
                </div>

                <div
                  style={
                    fieldGroupStyle
                  }
                >
                  <label>
                    Assign Services
                  </label>

                  <div
                    style={{
                      display:
                        "flex",
                      flexDirection:
                        "column",
                      gap: "8px",
                      marginTop:
                        "8px",
                    }}
                  >
                    {services.length ===
                    0 ? (
                      <p
                        style={{
                          fontSize:
                            "14px",
                          opacity:
                            0.65,
                        }}
                      >
                        No active
                        services
                        available.
                        Create a
                        service
                        first.
                      </p>
                    ) : (
                      services.map(
                        (service) => {
                          const checked =
                            (
                              form.serviceIds ??
                              []
                            ).includes(
                              service.id,
                            );

                          return (
                            <label
                              key={
                                service.id
                              }
                              style={{
                                display:
                                  "flex",
                                gap:
                                  "10px",
                                alignItems:
                                  "center",
                                cursor:
                                  "pointer",
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={
                                  checked
                                }
                                onChange={() =>
                                  toggleService(
                                    service.id,
                                  )
                                }
                              />

                              <span>
                                {
                                  service.name
                                }{" "}
                                — ₹
                                {Number(
                                  service.price,
                                ).toLocaleString(
                                  "en-IN",
                                )}
                              </span>
                            </label>
                          );
                        },
                      )
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "flex-end",
                    gap: "10px",
                    marginTop:
                      "24px",
                  }}
                >
                  <button
                    type="button"
                    onClick={
                      closeForm
                    }
                    style={
                      secondaryButtonStyle
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      saving
                    }
                    style={
                      primaryButtonStyle
                    }
                  >
                    {saving
                      ? "Saving..."
                      : editingStaff
                        ? "Update Staff"
                        : "Add Staff"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Invitation modal */}

        {showInvite && (
          <div
            style={overlayStyle}
          >
            <div
              style={modalStyle}
            >
              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center",
                  marginBottom:
                    "20px",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                  }}
                >
                  Invite Staff
                </h2>

                <button
                  type="button"
                  onClick={() => {
                    setShowInvite(
                      false,
                    );
                    setInvitationUrl(
                      "",
                    );
                  }}
                  style={
                    closeButtonStyle
                  }
                >
                  ×
                </button>
              </div>

              <p
                style={{
                  opacity: 0.7,
                  fontSize:
                    "14px",
                }}
              >
                Send an invitation
                using the staff
                member's email or
                phone number.
              </p>

              <form
                onSubmit={
                  handleInvite
                }
              >
                <div
                  style={
                    fieldGroupStyle
                  }
                >
                  <label>
                    Email
                  </label>

                  <input
                    type="email"
                    value={
                      inviteForm.email
                    }
                    onChange={(event) =>
                      setInviteForm(
                        (
                          current,
                        ) => ({
                          ...current,
                          email:
                            event
                              .target
                              .value,
                        }),
                      )
                    }
                    placeholder="staff@example.com"
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
                  <label>
                    Phone
                  </label>

                  <input
                    value={
                      inviteForm.phone
                    }
                    onChange={(event) =>
                      setInviteForm(
                        (
                          current,
                        ) => ({
                          ...current,
                          phone:
                            event
                              .target
                              .value,
                        }),
                      )
                    }
                    placeholder="9876543210"
                    style={
                      inputStyle
                    }
                  />
                </div>

                <button
                  type="submit"
                  disabled={
                    saving
                  }
                  style={
                    primaryButtonStyle
                  }
                >
                  {saving
                    ? "Creating..."
                    : "Create Invitation"}
                </button>
              </form>

              {invitationUrl && (
                <div
                  style={{
                    marginTop:
                      "20px",
                    padding:
                      "14px",
                    border:
                      "1px solid rgba(34,197,94,.5)",
                    borderRadius:
                      "10px",
                  }}
                >
                  <strong>
                    Invitation created
                  </strong>

                  <p
                    style={{
                      fontSize:
                        "13px",
                      wordBreak:
                        "break-all",
                      margin:
                        "10px 0",
                    }}
                  >
                    {invitationUrl}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigator.clipboard.writeText(
                        invitationUrl,
                      )
                    }
                    style={
                      secondaryButtonStyle
                    }
                  >
                    Copy Invitation Link
                  </button>

                  <Link
                    href={
                      invitationUrl
                    }
                    target="_blank"
                    style={{
                      display:
                        "inline-block",
                      marginLeft:
                        "10px",
                      fontSize:
                        "14px",
                    }}
                  >
                    Open
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

const cardStyle: React.CSSProperties =
  {
    padding: "22px",
    borderRadius: "14px",
    border:
      "1px solid rgba(128,128,128,.25)",
    background:
      "var(--card-bg, rgba(128,128,128,.06))",
  };

const modalStyle: React.CSSProperties =
  {
    width: "100%",
    maxWidth: "620px",
    maxHeight: "90vh",
    overflowY: "auto",
    padding: "26px",
    borderRadius: "16px",
    background:
      "var(--background, #fff)",
    border:
      "1px solid rgba(128,128,128,.25)",
    boxShadow:
      "0 25px 80px rgba(0,0,0,.25)",
  };

const overlayStyle: React.CSSProperties =
  {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    background:
      "rgba(0,0,0,.55)",
  };

const fieldGroupStyle: React.CSSProperties =
  {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    marginBottom: "16px",
  };

const inputStyle: React.CSSProperties =
  {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 12px",
    borderRadius: "9px",
    border:
      "1px solid rgba(128,128,128,.35)",
    background:
      "var(--background, #fff)",
    color:
      "var(--foreground, inherit)",
    fontSize: "14px",
  };

const primaryButtonStyle: React.CSSProperties =
  {
    border: "none",
    borderRadius: "9px",
    padding: "10px 16px",
    cursor: "pointer",
    background:
      "var(--primary, #111827)",
    color: "#fff",
    fontWeight: 600,
  };

const secondaryButtonStyle: React.CSSProperties =
  {
    border:
      "1px solid rgba(128,128,128,.35)",
    borderRadius: "9px",
    padding: "10px 16px",
    cursor: "pointer",
    background:
      "transparent",
    color:
      "var(--foreground, inherit)",
    fontWeight: 500,
  };

const dangerButtonStyle: React.CSSProperties =
  {
    border:
      "1px solid #ef4444",
    borderRadius: "9px",
    padding: "10px 16px",
    cursor: "pointer",
    background:
      "transparent",
    color: "#ef4444",
    fontWeight: 500,
  };

const closeButtonStyle: React.CSSProperties =
  {
    border: "none",
    background:
      "transparent",
    fontSize: "28px",
    lineHeight: 1,
    cursor: "pointer",
    opacity: 0.7,
  };

const messageStyle: React.CSSProperties =
  {
    padding: "12px 14px",
    borderRadius: "10px",
    background:
      "rgba(128,128,128,.07)",
  };

const statusStyle: React.CSSProperties =
  {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: "999px",
    border: "1px solid",
    fontSize: "12px",
    fontWeight: 600,
    whiteSpace: "nowrap",
  };

const tagStyle: React.CSSProperties =
  {
    padding: "5px 9px",
    borderRadius: "999px",
    background:
      "rgba(128,128,128,.12)",
    fontSize: "12px",
  };