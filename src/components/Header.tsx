import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { RootState } from '../store/store';
import { logout } from '../store/authSlice';
import { authApi } from '../api/endpoints';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { user, refreshToken } = useSelector((s: RootState) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = isNavOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isNavOpen]);

  const handleLogout = async () => {
    if (isNavOpen) setIsNavOpen(false);
    // Tell backend to invalidate the refresh token
    if (refreshToken) await authApi.logout(refreshToken);
    dispatch(logout());
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-navy/90 backdrop-blur-sm border-white/5">
      <div className="flex items-center justify-between h-16 px-4 mx-auto md:h-20 max-w-7xl sm:px-6 lg:px-8">
        <Link
          to="/"
          className="font-serif text-2xl md:text-[28px] font-normal tracking-wide text-white"
          aria-label="Go to home"
        >
          My Logo
        </Link>

        <nav className="hidden md:flex items-center gap-2.5">
          {user ? (
            <>
              <span className="hidden font-sans text-sm text-white sm:block">
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center px-4 py-2 text-sm font-bold text-white transition-all duration-200 border rounded min-w-40 bg-gold hover:bg-transparent hover:text-gold border-gold"
                aria-label="Log out of your account"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="flex items-center justify-center px-4 py-2 text-sm font-bold transition-all duration-200 border rounded min-w-40 text-gold hover:text-white border-gold hover:bg-gold"
                aria-label="Log in to your account"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="flex items-center justify-center px-4 py-2 text-sm font-bold text-white transition-all duration-200 border rounded min-w-40 bg-gold hover:bg-transparent hover:text-gold border-gold"
                aria-label="Sign up for a new account"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
        {/* Mobile Menu Button */}
        <button
          className="flex items-center justify-center transition-all rounded-md md:hidden min-w-12 min-h-12 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-navy"
          onClick={() => setIsNavOpen(!isNavOpen)}
          aria-label="Toggle navigation menu"
        >
          <Menu size={28} />
        </button>
      </div>

      {/* Mobile Drawer */}
      {isNavOpen &&
        createPortal(
          <div
            className="fixed inset-0 flex z-[60] md:hidden"
            onClick={() => setIsNavOpen(false)}
            aria-label="Close navigation menu"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <div
              className="relative flex flex-col w-3/4 h-full px-6 pt-32 pb-10 ml-auto transition-transform shadow-2xl bg-navy-dark"
              onClick={e => e.stopPropagation()}
              ref={menuRef}
            >
              <button
                onClick={() => setIsNavOpen(false)}
                className="absolute flex items-center justify-center w-10 h-10 top-4 right-5 text-white/70 hover:text-white"
                aria-label="Close navigation menu"
              >
                <X size={32} />
              </button>

              <nav className="w-full">
                <ul className="flex flex-col w-full gap-6">
                  {user ? (
                    <>
                      <div className="px-4 mb-4">
                        <p className="mb-1 text-xs tracking-widest uppercase text-white/40">
                          Account
                        </p>
                        <p className="font-sans text-sm text-white truncate">
                          {user.email}
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center justify-center w-full h-12 text-sm font-bold text-white transition-all duration-200 border rounded bg-gold border-gold active:scale-95"
                        aria-label="Log out of your account"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setIsNavOpen(false)}
                        className="flex items-center justify-center w-full h-12 text-sm font-bold transition-all duration-200 border rounded text-gold border-gold hover:bg-gold hover:text-white active:scale-95"
                        aria-label="Log in to your account"
                      >
                        Log In
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setIsNavOpen(false)}
                        className="flex items-center justify-center w-full h-12 text-sm font-bold text-white transition-all duration-200 border rounded bg-gold border-gold active:scale-95"
                        aria-label="Sign up for a new account"
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </ul>
              </nav>
            </div>
          </div>,
          document.getElementById('portal-root')!
        )}
    </header>
  );
}
