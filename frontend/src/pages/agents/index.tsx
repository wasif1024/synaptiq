import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { agentsAPI } from '@/lib/api';
import { FiPlus, FiCpu, FiTrash2, FiEdit } from 'react-icons/fi';
import Link from 'next/link';
import styles from '@/styles/Agents.module.css';

export default function AgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);

  useEffect(() => {
    agentsAPI.list().then(r => setAgents(r.data)).catch(() => {});
  }, []);

  const handleDelete = async (id: number) => {
    try { await agentsAPI.delete(id); setAgents(prev => prev.filter(a => a.id !== id)); } catch {}
  };

  return (
    <AppLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1>Agents</h1>
            <p className={styles.subtitle}>Manage your AI agents</p>
          </div>
          <Link href="/agents/builder" className={styles.primaryBtn}><FiPlus /> Create Agent</Link>
        </div>
        <div className={styles.grid}>
          {agents.map(a => (
            <div key={a.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.agentIcon}><FiCpu /></div>
                <div className={styles.cardActions}>
                  <Link href={`/agents/builder?id=${a.id}`} className={styles.iconBtn}><FiEdit /></Link>
                  <button className={styles.iconBtn} onClick={() => handleDelete(a.id)}><FiTrash2 /></button>
                </div>
              </div>
              <h3>{a.name}</h3>
              <p className={styles.desc}>{a.description || 'No description'}</p>
              <div className={styles.model}>{a.model}</div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}