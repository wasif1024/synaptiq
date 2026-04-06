import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AppLayout from '@/components/layout/AppLayout';
import { agentsAPI } from '@/lib/api';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import Link from 'next/link';
import styles from '@/styles/Builder.module.css';

export default function AgentBuilderPage() {
  const router = useRouter();
  const editId = router.query.id ? Number(router.query.id) : null;
  const [form, setForm] = useState({ name: '', description: '', system_prompt: '', model: 'claude-3-5-sonnet-latest', tools: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editId) {
      agentsAPI.get(editId).then(r => {
        const a = r.data;
        setForm({ name: a.name, description: a.description || '', system_prompt: a.system_prompt, model: a.model, tools: a.tools || '' });
      }).catch(() => {});
    }
  }, [editId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editId) {
        await agentsAPI.update(editId, form);
      } else {
        await agentsAPI.create(form);
      }
      router.push('/agents');
    } catch {}
    setSaving(false);
  };

  return (
    <AppLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <Link href="/agents" className={styles.backBtn}><FiArrowLeft /> Back</Link>
          <h1>{editId ? 'Edit Agent' : 'Create Agent'}</h1>
        </div>
        <div className={styles.form}>
          <div className={styles.field}>
            <label>Name</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Agent name" />
          </div>
          <div className={styles.field}>
            <label>Description</label>
            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief description" />
          </div>
          <div className={styles.field}>
            <label>Model</label>
            <select value={form.model} onChange={e => setForm({ ...form, model: e.target.value })}>
              <option value="claude-3-5-sonnet-latest">Claude 3.5 Sonnet</option>
              <option value="claude-3-opus-latest">Claude 3 Opus</option>
              <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
            </select>
          </div>
          <div className={styles.field}>
            <label>System Prompt</label>
            <textarea rows={8} value={form.system_prompt} onChange={e => setForm({ ...form, system_prompt: e.target.value })} placeholder="Define the agent's behavior..." />
          </div>
          <button className={styles.saveBtn} onClick={handleSave} disabled={saving || !form.name || !form.system_prompt}>
            <FiSave /> {saving ? 'Saving...' : 'Save Agent'}
          </button>
        </div>
      </div>
    </AppLayout>
  );
}