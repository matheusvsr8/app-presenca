'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, FolderOpen, BarChart2, LogOut } from 'lucide-react';
import styles from './navbar.module.css';

export default function FloatingNavbar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', icon: Home, label: 'Dashboard' },
    { href: '/admin/students', icon: Users, label: 'Alunos' },
    { href: '/admin/courses', icon: FolderOpen, label: 'Cursos' },
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
            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            {isActive && <div className={styles.activeIndicator} />}
          </Link>
        );
      })}
      
      {/* Separador */}
      <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }} />
      
      {/* Botão de Sair */}
      <a href="/api/auth/signout" className={styles.navItem} title="Sair" style={{ color: 'var(--error)' }}>
        <LogOut size={22} strokeWidth={2} />
      </a>
    </nav>
  );
}
