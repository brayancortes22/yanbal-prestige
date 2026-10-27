import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, ShieldAlert } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useConfig } from '../../context/ConfigContext';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ searchQuery, onSearchChange }) => {
  const { totalItems, openCart } = useCart();
  const { announcements } = useConfig();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Inicio', path: '/' },
    { label: 'Catálogo', path: '/catalogo' },
    { label: 'Quiénes Somos', path: '/quienes-somos' },
    { label: 'Eventos', path: '/eventos' },
    { label: 'Tips', path: '/tips' },
    { label: 'Trabaja con nosotros', path: '/unete' },
  ];

  return (
    <>
      <aside className="bg-stone-900 text-stone-300 text-xs py-2 px-4 border-b border-stone-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            <span className="text-[11px] sm:text-xs">
              {announcements.topBannerText}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/unete"
              className="text-[11px] text-orange-400 hover:text-orange-300 font-semibold underline underline-offset-2 transition-colors"
            >
              Trabaja con nosotros. ¡Regístrate aquí!
            </Link>
            <Link
              to="/admin"
              className="text-[10px] text-stone-400 hover:text-white transition-colors flex items-center gap-1 border-l border-stone-700 pl-3"
              title="Acceso CMS Directora"
            >
              <ShieldAlert className="w-3 h-3 text-orange-500" />
              <span>Acceso CMS</span>
            </Link>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-40 glass-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 font-serif text-xl font-bold">
              Y
            </div>
            <div>
              <span className="font-editorial text-2xl font-bold tracking-tight text-stone-900 block leading-tight">
                YANBAL <span className="text-orange-600 italic font-normal text-xl">Prestige</span>
              </span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-stone-500 block">
                Comunidad de Belleza
              </span>
            </div>
          </Link>

          <div className="hidden xl:flex items-center relative w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3" />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                if (location.pathname !== '/catalogo') navigate('/catalogo');
              }}
              className="w-full pl-9 pr-3 py-2 rounded-full border border-stone-200 text-xs focus:outline-none focus:border-orange-500 bg-stone-50/50"
            />
          </div>

          <nav className="hidden lg:flex items-center gap-5 text-sm font-medium whitespace-nowrap">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`py-1 relative transition-colors ${
                    isActive ? 'text-orange-600 font-semibold' : 'text-stone-700 hover:text-orange-600'
                  }`}
                >
                  {item.label}
                  {isActive && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-600 rounded-full"></span>}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={openCart}
              className="relative p-2.5 rounded-full bg-stone-100 hover:bg-orange-50 text-stone-800 hover:text-orange-600 transition-all flex items-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="text-xs font-bold hidden sm:inline">Carrito</span>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-orange-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-stone-700 hover:bg-stone-100 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-stone-200 bg-white/95 backdrop-blur-md px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2 px-3 rounded-lg text-sm font-medium ${
                  location.pathname === item.path ? 'bg-orange-50 text-orange-600 font-bold' : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </header>
    </>
  );
};
