"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  createOwnerService,
  deleteOwnerService,
  getOwnerServices,
  OwnerService,
  updateOwnerService,
} from "../../../lib/api";

import { useAuth } from "../../../context/AuthContext";

export default function OwnerServicesPage() {
  const router = useRouter();

  const {
    user,
    token,
    loading: authLoading,
  } = useAuth();

  const [services, setServices] =
    useState<OwnerService[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [name, setName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [price, setPrice] =
    useState("");

  const [durationMinutes, setDurationMinutes] =
    useState("");

  const [active, setActive] =
    useState(true);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user || !token) {
      router.replace(
        "/login?redirect=/owner/services",
      );
      return;
    }

    if (user.role !== "SALON_ADMIN") {
      router.replace("/");
      return;
    }

    loadServices(token);
  }, [
    authLoading,
    user,
    token,
    router,
  ]);

  async function loadServices(
    authToken: string,
  ) {
    try {
      setLoading(true);
      setError("");

      const data =
        await getOwnerServices(
          authToken,
        );

      setServices(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load services.",
      );
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setEditingId(null);
    setName("");
    setDescription("");
    setPrice("");
    setDurationMinutes("");
    setActive(true);
  }

  function startEdit(
    service: OwnerService,
  ) {
    setEditingId(service.id);

    setName(service.name);

    setDescription(
      service.description || "",
    );

    setPrice(
      String(service.price),
    );

    setDurationMinutes(
      String(
        service.durationMinutes,
      ),
    );

    setActive(service.active);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!token) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const serviceData = {
        name: name.trim(),
        description:
          description.trim() || undefined,
        price: Number(price),
        durationMinutes:
          Number(durationMinutes),
        active,
      };

      if (editingId) {
        const updated =
          await updateOwnerService(
            token,
            editingId,
            serviceData,
          );

        setServices((current) =>
          current.map((service) =>
            service.id === editingId
              ? updated
              : service,
          ),
        );
      } else {
        const created =
          await createOwnerService(
            token,
            serviceData,
          );

        setServices((current) => [
          created,
          ...current,
        ]);
      }

      resetForm();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save service.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(
    service: OwnerService,
  ) {
    if (!token) {
      return;
    }

    try {
      setError("");

      const updated =
        await updateOwnerService(
          token,
          service.id,
          {
            active: !service.active,
          },
        );

      setServices((current) =>
        current.map((item) =>
          item.id === service.id
            ? updated
            : item,
        ),
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update service.",
      );
    }
  }

  async function handleDelete(
    service: OwnerService,
  ) {
    if (!token) {
      return;
    }

    const confirmed =
      window.confirm(
        `Are you sure you want to remove "${service.name}"?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const result =
        await deleteOwnerService(
          token,
          service.id,
        );

      /*
       * If the backend soft-deactivated
       * a service because it has appointment
       * history, update it instead of removing it.
       */
      setServices((current) =>
        current
          .map((item) =>
            item.id === service.id
              ? result
              : item,
          )
          .filter(
            (item) =>
              item.id !== service.id ||
              item.active === false,
          ),
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to delete service.",
      );
    }
  }

  if (authLoading || loading) {
    return (
      <div className="page-container">
        <div className="loading-card">
          <div className="spinner" />

          <p>
            Loading services...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="details-header">
        <div>
          <p className="eyebrow">
            OWNER PORTAL
          </p>

          <h1>
            Services
          </h1>

          <p className="page-subtitle">
            Manage the services your salon
            offers to customers.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={resetForm}
        >
          + New Service
        </button>
      </div>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      <div className="details-card">
        <h2>
          {editingId
            ? "Edit service"
            : "Add service"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="auth-form"
        >
          <div className="form-group">
            <label>
              Service name
            </label>

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value,
                )
              }
              placeholder="Classic Haircut"
              required
            />
          </div>

          <div className="form-group">
            <label>
              Description
            </label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              placeholder="Describe this service..."
              rows={4}
            />
          </div>

          <div className="details-grid">
            <div className="form-group">
              <label>
                Price (₹)
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(event) =>
                  setPrice(
                    event.target.value,
                  )
                }
                placeholder="300"
                required
              />
            </div>

            <div className="form-group">
              <label>
                Duration (minutes)
              </label>

              <input
                type="number"
                min="5"
                max="1440"
                value={
                  durationMinutes
                }
                onChange={(event) =>
                  setDurationMinutes(
                    event.target.value,
                  )
                }
                placeholder="30"
                required
              />
            </div>
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <input
              type="checkbox"
              checked={active}
              onChange={(event) =>
                setActive(
                  event.target.checked,
                )
              }
            />

            Active — customers can book
            this service
          </label>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Service"
                  : "Add Service"}
            </button>

            {editingId && (
              <button
                type="button"
                className="secondary-button"
                onClick={
                  resetForm
                }
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div
        style={{
          marginTop: "24px",
        }}
      >
        {services.length === 0 ? (
          <div className="empty-card">
            <h2>
              No services yet
            </h2>

            <p>
              Add your first service so
              customers can see what your
              salon offers.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "16px",
            }}
          >
            {services.map(
              (service) => (
                <div
                  key={service.id}
                  className="details-card"
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
                      <h3>
                        {
                          service.name
                        }
                      </h3>

                      <p
                        style={{
                          opacity: 0.65,
                        }}
                      >
                        {
                          service.durationMinutes
                        }{" "}
                        minutes
                      </p>
                    </div>

                    <strong>
                      ₹
                      {Number(
                        service.price,
                      ).toLocaleString(
                        "en-IN",
                      )}
                    </strong>
                  </div>

                  {service.description && (
                    <p>
                      {
                        service.description
                      }
                    </p>
                  )}

                  <p>
                    <strong>
                      {service.active
                        ? "ACTIVE"
                        : "INACTIVE"}
                    </strong>
                  </p>

                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() =>
                        startEdit(
                          service,
                        )
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() =>
                        handleToggle(
                          service,
                        )
                      }
                    >
                      {service.active
                        ? "Deactivate"
                        : "Activate"}
                    </button>

                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() =>
                        handleDelete(
                          service,
                        )
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}