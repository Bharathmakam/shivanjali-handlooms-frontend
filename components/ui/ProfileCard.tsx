import { useState } from 'react';
import FormInput from './FormInput';
import Button from './Button';
import styles from './ProfileCard.module.css';

interface ProfileCardProps {
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  onUpdate: (data: { firstName: string; lastName: string; phone: string }) => Promise<void>;
  className?: string;
}

export default function ProfileCard({ profile, onUpdate, className = '' }: ProfileCardProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: profile.firstName,
    lastName: profile.lastName,
    phone: profile.phone || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(form);
      setEditing(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone || '',
    });
    setEditing(false);
  };

  return (
    <div className={`${styles.card} ${className}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>My Profile</h2>
        {!editing && (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            Edit Profile
          </Button>
        )}
      </div>

      {editing ? (
        <div className={styles.form}>
          <div className={styles.formGrid}>
            <FormInput
              label="First Name"
              value={form.firstName}
              onChange={(v) => setForm({ ...form, firstName: v })}
              required
            />
            <FormInput
              label="Last Name"
              value={form.lastName}
              onChange={(v) => setForm({ ...form, lastName: v })}
              required
            />
            <FormInput
              label="Phone"
              value={form.phone}
              onChange={(v) => setForm({ ...form, phone: v })}
              placeholder="+91 98765 43210"
            />
            <FormInput
              label="Email"
              value={profile.email}
              onChange={() => {}}
              disabled
            />
          </div>
          <div className={styles.formActions}>
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave} loading={saving}>
              Save Changes
            </Button>
          </div>
        </div>
      ) : (
        <div className={styles.info}>
          <div className={styles.row}>
            <span className={styles.label}>Name:</span>
            <span>{profile.firstName} {profile.lastName}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Email:</span>
            <span>{profile.email}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Phone:</span>
            <span>{profile.phone || 'Not set'}</span>
          </div>
        </div>
      )}
    </div>
  );
}
