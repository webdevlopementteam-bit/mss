import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import * as authService from "../../api/authService";
import { C, Ico, I, Toast, Field, Section } from "./shared";

const toProfileShape = (user) => ({
  firstName: user?.firstName || "",
  lastName: user?.lastName || "",
  email: user?.email || "",
  phone: user?.phone || "",
  organisation: user?.organisation || "",
  address: user?.address || "",
  city: user?.city || "",
  state: user?.state || "",
  zip: user?.zip || "",
});

export default function ProfileView() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const isFirstTimeSetup = !user?.profileCompleted;

  const profile = toProfileShape(user);
  const [editMode, setEditMode] = useState(isFirstTimeSetup);
  const [draft, setDraft] = useState(profile);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const saveProfile = async () => {
    if (!draft.phone?.trim()) {
      showToast("Mobile number is required.");
      return;
    }

    try {
      setSaving(true);
      const { firstName, lastName, phone, organisation, address, city, state, zip } = draft;
      const { data } = await authService.updateProfile({
        firstName, lastName, phone, organisation, address, city, state, zip,
      });
      setUser(data.data);
      setEditMode(false);
      showToast("Profile updated successfully.");
      navigate("/user-dashboard");
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        marginBottom: 24, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 21, fontWeight: 800, color: C.text, margin: "0 0 4px", letterSpacing: "-.3px" }}>
            My Profile
          </h2>
          <p style={{ fontSize: 13, color: C.subtle, margin: 0 }}>
            {isFirstTimeSetup
              ? "Please complete your profile to continue"
              : "Manage your account information"}
          </p>
        </div>
        {!editMode ? (
          <button onClick={() => { setDraft(profile); setEditMode(true); }}
            style={{ display: "flex", alignItems: "center", gap: 7, background: C.red,
              color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px",
              fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            <Ico d={I.edit} size={15} color="#fff" />
            Edit profile
          </button>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            {!isFirstTimeSetup && (
              <button onClick={() => setEditMode(false)}
                style={{ background: "#f3f4f6", border: "none", borderRadius: 10, padding: "10px 18px",
                  fontSize: 13, fontWeight: 600, cursor: "pointer", color: C.muted }}>
                Discard
              </button>
            )}
            <button onClick={saveProfile} disabled={saving}
              style={{ display: "flex", alignItems: "center", gap: 7, background: C.red,
                color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px",
                fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              <Ico d={I.save} size={15} color="#fff" />
              {saving ? "Saving..." : isFirstTimeSetup ? "Complete Profile" : "Save changes"}
            </button>
          </div>
        )}
      </div>

      <Section title="Personal information">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 16px" }}>
          <Field label="First name" half value={editMode ? draft.firstName : profile.firstName}
            onChange={e => setDraft(p => ({ ...p, firstName: e.target.value }))} disabled={!editMode} />
          <Field label="Last name" half value={editMode ? draft.lastName : profile.lastName}
            onChange={e => setDraft(p => ({ ...p, lastName: e.target.value }))} disabled={!editMode} />
          <Field label="Email address" value={profile.email} type="email"
            onChange={() => {}} disabled />
          <Field label="Phone number *" half value={editMode ? draft.phone : profile.phone}
            onChange={e => setDraft(p => ({ ...p, phone: e.target.value }))} disabled={!editMode} />
          <Field label="Organisation / Hospital" half value={editMode ? draft.organisation : profile.organisation}
            onChange={e => setDraft(p => ({ ...p, organisation: e.target.value }))} disabled={!editMode} />
        </div>
      </Section>

      <Section title="Shipping address">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 16px" }}>
          <Field label="Street address" value={editMode ? draft.address : profile.address}
            onChange={e => setDraft(p => ({ ...p, address: e.target.value }))} disabled={!editMode} />
          <Field label="City" half value={editMode ? draft.city : profile.city}
            onChange={e => setDraft(p => ({ ...p, city: e.target.value }))} disabled={!editMode} />
          <Field label="State" half value={editMode ? draft.state : profile.state}
            onChange={e => setDraft(p => ({ ...p, state: e.target.value }))} disabled={!editMode} />
          <Field label="PIN code" half value={editMode ? draft.zip : profile.zip}
            onChange={e => setDraft(p => ({ ...p, zip: e.target.value }))} disabled={!editMode} />
        </div>
      </Section>

      <Toast msg={toast} onClose={() => setToast("")} />
    </div>
  );
}
