import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { conversationsAPI } from '@/lib/api';
import { FiSearch, FiTrash2, FiMessageSquare } from 'react-icons/fi';
import Link from 'next/link';
import styles from '@/styles/Conversations.module.css';

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    conversationsAPI.list().then(r => setConversations(r.data)).catch(() => {});
  }, []);

  const filtered = conversations.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async (id: number) => {
    try {
      await conversationsAPI.delete(id);
      setConversations(prev => prev.filter(c => c.id !== id));
    } catch {}
  };

  return (
    <AppLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1>Conversations</h1>
            <p className={styles.subtitle}>{conversations.length} total conversations</p>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.toolbar}>
            <div className={styles.searchWrap}>
              <FiSearch />
              <input placeholder="Search conversations..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className={styles.list}>
            {filtered.map(c => (
              <div key={c.id} className={styles.row}>
                <Link href={`/?convo=${c.id}`} className={styles.rowContent}>
                  <FiMessageSquare className={styles.rowIcon} />
                  <div>
                    <div className={styles.rowTitle}>{c.title}</div>
                    <div className={styles.rowDate}>{new Date(c.updated_at).toLocaleDateString()}</div>
                  </div>
                </Link>
                <button className={styles.deleteBtn} onClick={() => handleDelete(c.id)}><FiTrash2 /></button>
              </div>
            ))}
            {filtered.length === 0 && <div className={styles.empty}>No conversations found</div>}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}