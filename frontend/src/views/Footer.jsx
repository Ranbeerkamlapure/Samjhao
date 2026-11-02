import { Link, useNavigate } from 'react-router-dom';
import BrandMark from './BrandMark';

function goToHomeTop(navigate) {
  if (window.location.pathname === '/') {
    if (window.location.hash) {
      window.history.replaceState(null, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  navigate('/');
  window.setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 0);
}

function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link
              to="/"
              className="brand"
              onClick={(event) => {
                event.preventDefault();
                goToHomeTop(navigate);
              }}
            >
              <BrandMark />
              Samjhao
            </Link>
            <p className="footer-tagline">
              Understand Your Documents. Make Better Decisions.
            </p>
            <p className="footer-desc">
              Making complicated paperwork easier to understand.
            </p>
          </div>

          <div className="footer-col">
            <h3>Quick Links</h3>
            <ul>
              <li>
                <Link
                  to="/"
                  onClick={(event) => {
                    event.preventDefault();
                    goToHomeTop(navigate);
                  }}
                >
                  Home
                </Link>
              </li>
              <li>
                <a href="/#how-it-works">How It Works</a>
              </li>
              <li>
                <a href="/#privacy">Privacy</a>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h3>Features</h3>
            <ul>
              <li>Document Explanation</li>
              <li>Multi-language Support</li>
              <li>Saved Document History</li>
            </ul>
          </div>

          <div className="footer-col">
            <h3>Languages</h3>
            <ul>
              <li>English</li>
              <li>हिन्दी</li>
              <li>मराठी</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Samjhao. All rights reserved.</p>
          <p>
            Built with React, Node.js, Express, MongoDB and Gemini AI.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
