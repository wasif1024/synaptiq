import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { FiKey, FiSave } from 'react-icons/fi';
import styles from '@/styles/Settings.module.css';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  return (
    <AppLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1>Settings</h1>
          <p className={styles.subtitle}>Configure your Synaptiq instance</p>
        </div>
        <div className={styles.card}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <FiKey className={styles.sectionIcon} />
              <h3>API Configuration</h3>
            </div>
            <p className={styles.note}>
              The Anthropic API key is managed through the platform&apos;s secure vault.
              Contact your administrator to configure the <code>ANTHROPIC_API_KEY</code> environment variable.
            </p>
          </div>
          <div className={styles.section}>
            <h3>Preferences</h3>
            <div className={styles.field}>
              <label>Default Model</label>
              <select defaultValue="claude-3-5-sonnet-latest">
                <option value="claude-3-5-sonnet-latest">Claude 3.5 Sonnet</option>
                <option value="claude-3-opus-latest">Claude 3 Opus</option>
                <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
              </select>
            </div>
            <button className={styles.saveBtn} onClick={() => setSaved(true)}>
              <FiSave /> {saved ? 'Saved!' : 'Save Preferences'}
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}