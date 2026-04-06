import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiMessageSquare, FiList, FiCpu, FiBook, FiSettings, FiMenu, FiX } from 'react-icons/fi';
import styles from './AppLayout.module.css';

const navItems = [
  { label: 'Chat', href: '/', icon: FiMessageSquare },
  { label: 'Conversations', href: '/conversations', icon: FiList },
  { label: 'Agents', href: '/agents', icon: FiCpu },
  { label: 'Knowledge', href: '/knowledge', icon: FiBook },
  { label: 'Settings', href: '/settings', icon: FiSettings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return router.pathname === '/';
    return router.pathname.startsWith(href);
  };

  return (
    <div className={styles.layout}>
      <button className={styles.mobileToggle} onClick={() => setOpen(!open)}>
        {open ? <FiX /> : <FiMenu />}
      </button>
      {open && <div className={styles.overlay} onClick={() => setOpen(false)} />}
      <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : ''}`}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>S</div>
          <div>
            <div className={styles.brandName}>Synaptiq</div>
            <div className={styles.brandSub}>by Myndlab</div>
          </div>
        </div>
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
              <div className={`${styles.navItem} ${isActive(item.href) ? styles.navItemActive : ''}`}>
                <item.icon className={styles.navIcon} />
                {item.label}
              </div>
            </Link>
          ))}
        </nav>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}