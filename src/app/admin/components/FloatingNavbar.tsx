'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, FolderOpen, BarChart2, LogOut, UserCog } from 'lucide-react';
import styles from './navbar.module.css';

export default function FloatingNavbar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', icon: Home, label: 'Dashboard' },
    { href: '/admin/students', icon: Users, label: 'Alunos' },
    { href: '/admin/courses', icon: FolderOpen, label: 'Cursos' },
    { href: '/admin/staff', icon: UserCog, label: 'Equipe' },
    { href: '/admin/reports', icon: BarChart2, label: 'Relatórios' },
  ];

  return (
    <nav className={styles.floatingNav}>
      {navItems.map((item) => {
        const Icon = item.icon;
        // Correspondência exata para a raiz, e verificação de prefixo para os outros
        const isActive = 
          item.href === '/admin' 
            ? pathname === '/admin' 
            : pathname.startsWith(item.href);

        return (
          <Link key={item.href} href={item.href} className={`${styles.navItem} ${isActive ? styles.active : ''}`} title={item.label}>
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            {isActive && <div className={styles.activeIndicator} />}
          </Link>
        );
      })}
      
      {/* Separador Sutil */}
      <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.12)', flexShrink: 0, margin: '0 2px' }} />
      
      {/* Botão de Sair */}
      <button 
        onClick={async () => {
          const { createClient } = await import('@/utils/supabase/client');
          const supabase = await createClient();
          await supabase.auth.signOut();
          window.location.href = '/login';
        }}
        className={styles.navItem} 
        title="Sair" 
        style={{ color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.55rem 0.3rem' }}
      >
        <LogOut size={20} strokeWidth={2} />
      </button>
    </nav>
  );
}
