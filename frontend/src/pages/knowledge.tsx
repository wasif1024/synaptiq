import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { knowledgeAPI } from '@/lib/api';
import { FiPlus, FiBook, FiFile, FiTrash2, FiX } from 'react-icons/fi';
import styles from '@/styles/Knowledge.module.css';

export default function KnowledgePage() {
  const [bases, setBases] = useState<any[]>([]);
  const [selectedKb, setSelectedKb] = useState<number | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [showAddDoc, setShowAddDoc] = useState(false);
  const [docForm, setDocForm] = useState({ filename: '', content: '', file_type: 'text' });

  useEffect(() => {
    knowledgeAPI.list().then(r => setBases(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedKb) knowledgeAPI.documents(selectedKb).then(r => setDocuments(r.data)).catch(() => {});
  }, [selectedKb]);

  const createKb = async () => {
    if (!newName) return;
    try {
      const r = await knowledgeAPI.create({ name: newName, description: newDesc });
      setBases(prev => [r.data, ...prev]);
      setShowCreate(false); setNewName(''); setNewDesc('');
    } catch {}
  };

  const addDoc = async () => {
    if (!selectedKb || !docForm.filename || !docForm.content) return;
    try {
      const r = await knowledgeAPI.addDocument(selectedKb, docForm);
      setDocuments(prev => [r.data, ...prev]);
      setShowAddDoc(false); setDocForm({ filename: '', content: '', file_type: 'text' });
    } catch {}
  };

  const deleteDoc = async (docId: number) => {
    if (!selectedKb) return;
    try {
      await knowledgeAPI.deleteDocument(selectedKb, docId);
      setDocuments(prev => prev.filter(d => d.id !== docId));
    } catch {}
  };

  return (
    <AppLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div><h1>Knowledge Base</h1><p className={styles.subtitle}>Manage knowledge sources for your agents</p></div>
          <button className={styles.primaryBtn} onClick={() => setShowCreate(true)}><FiPlus /> New Base</button>
        </div>
        {showCreate && (
          <div className={styles.createCard}>
            <div className={styles.createHeader}><span>Create Knowledge Base</span><button onClick={() => setShowCreate(false)}><FiX /></button></div>
            <input placeholder="Name" value={newName} onChange={e => setNewName(e.target.value)} />
            <input placeholder="Description" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
            <button className={styles.primaryBtn} onClick={createKb}>Create</button>
          </div>
        )}
        <div className={styles.layout}>
          <div className={styles.kbList}>
            {bases.map(kb => (
              <div key={kb.id} className={`${styles.kbItem} ${selectedKb === kb.id ? styles.kbActive : ''}`} onClick={() => setSelectedKb(kb.id)}>
                <FiBook className={styles.kbIcon} />
                <div><div className={styles.kbName}>{kb.name}</div><div className={styles.kbDesc}>{kb.description || 'No description'}</div></div>
              </div>
            ))}
            {bases.length === 0 && <div className={styles.empty}>No knowledge bases yet</div>}
          </div>
          <div className={styles.docPanel}>
            {selectedKb ? (
              <>
                <div className={styles.docHeader}>
                  <h3>Documents</h3>
                  <button className={styles.smallBtn} onClick={() => setShowAddDoc(true)}><FiPlus /> Add</button>
                </div>
                {showAddDoc && (
                  <div className={styles.addDocForm}>
                    <input placeholder="Filename" value={docForm.filename} onChange={e => setDocForm({ ...docForm, filename: e.target.value })} />
                    <textarea placeholder="Content" rows={4} value={docForm.content} onChange={e => setDocForm({ ...docForm, content: e.target.value })} />
                    <div className={styles.addDocActions}>
                      <button className={styles.smallBtn} onClick={addDoc}>Save</button>
                      <button className={styles.cancelBtn} onClick={() => setShowAddDoc(false)}>Cancel</button>
                    </div>
                  </div>
                )}
                {documents.map(d => (
                  <div key={d.id} className={styles.docItem}>
                    <FiFile />
                    <div className={styles.docName}>{d.filename}</div>
                    <span className={styles.docType}>{d.file_type}</span>
                    <button className={styles.iconBtn} onClick={() => deleteDoc(d.id)}><FiTrash2 /></button>
                  </div>
                ))}
                {documents.length === 0 && !showAddDoc && <div className={styles.empty}>No documents</div>}
              </>
            ) : (
              <div className={styles.empty}>Select a knowledge base</div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}