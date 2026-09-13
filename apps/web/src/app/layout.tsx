import { Outlet } from 'react-router';
import './Layout.module.css';

export function Layout() {
  return (
    <div className="layout">
      <header className="layout__header">
        <span className="layout__logo">Магазин</span>
      </header>
      <main className="layout__main">
        <Outlet />
      </main>
    </div>
  );
}
