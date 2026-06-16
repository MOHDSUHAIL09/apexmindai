// src/Pages/Components/Header.js
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = ({ toggleSidebar }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Close menu on ESC key
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        closeMobileMenu();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <>
      <header className="mk-header">
        <div className="mk-header-container">
          {/* Left Section */}
          <div className="mk-header-left">

            <Link to="/" className="mk-logo">
              <img 
                src="https://bootstrapdemos.adminmart.com/modernize/dist/assets/images/logos/dark-logo.svg" 
                alt="Logo" 
                className="mk-logo-img"
              />
            </Link>

            <div className="mk-nav-links">
              <Link to="/" className="mk-nav-link">Home</Link>
              <Link to="/about" className="mk-nav-link">About</Link>
              <Link to="/contact" className="mk-nav-link">Contact</Link>
            </div>
          </div>

          {/* Right Section */}
          <div className="mk-header-right">
            <div className="mk-auth-buttons">
              <Link to="/login">
                <button className="mk-btn mk-btn-outline">Sign In</button>
              </Link>
              <Link to="/signup">
                <button className="mk-btn mk-btn-primary">Sign Up</button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className={`mk-mobile-menu-btn ${isMobileMenuOpen ? 'active' : ''}`} 
              onClick={toggleMobileMenu}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`mk-mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={closeMobileMenu}>
        <div className={`mk-mobile-menu ${isMobileMenuOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
          <div className="mk-mobile-menu-header">
            <Link to="/" className="mk-mobile-logo" onClick={closeMobileMenu}>
              <img 
                src="https://bootstrapdemos.adminmart.com/modernize/dist/assets/images/logos/dark-logo.svg" 
                alt="Logo" 
              />
            </Link>
            <button className="mk-mobile-close" onClick={closeMobileMenu}>
              <i className="ti ti-x"></i>
            </button>
          </div>
          
          <div className="mk-mobile-nav">
            <Link to="/" className="mk-mobile-nav-link" onClick={closeMobileMenu}>
              <i className="ti ti-home"></i>
              <span>Home</span>
            </Link>
            <Link to="/about" className="mk-mobile-nav-link" onClick={closeMobileMenu}>
              <i className="ti ti-info-circle"></i>
              <span>About</span>
            </Link>
            <Link to="/contact" className="mk-mobile-nav-link" onClick={closeMobileMenu}>
              <i className="ti ti-phone"></i>
              <span>Contact</span>
            </Link>
          </div>

          <div className="mk-mobile-auth">
            <Link to="/login" onClick={closeMobileMenu}>
              <button className="mk-mobile-btn mk-mobile-btn-outline">Sign In</button>
            </Link>
            <Link to="/signup" onClick={closeMobileMenu}>
              <button className="mk-mobile-btn mk-mobile-btn-primary">Sign Up</button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;