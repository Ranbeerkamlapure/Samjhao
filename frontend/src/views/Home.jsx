import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import BrandMark from './BrandMark';
import { useAuth } from '../App';

function scrollToHash() {
  const id = window.location.hash.replace(/^#/, '');
  if (!id) return;
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function PhoneShowcase() {
  return (
    <div className="phone-stage" aria-hidden="false">
      <div className="phone-glow" aria-hidden="true" />
      <div className="phone-device">
        <div className="phone-notch" aria-hidden="true" />
        <div className="phone-screen">
          <div className="phone-app-bar">
            <BrandMark className="brand-mark-sm" />
            <span>Samjhao</span>
          </div>

          <div className="phone-doc-preview">
            <span className="phone-doc-label">Electricity Bill</span>
            <span className="phone-doc-meta">Uploaded · Marathi</span>
          </div>

          <div className="phone-block">
            <h4>Summary</h4>
            <p>Your March electricity bill. Pay ₹1,240 before the due date.</p>
          </div>

          <div className="phone-row">
            <div className="phone-block phone-block-sm">
              <h4>Amount</h4>
              <p>₹1,240</p>
            </div>
            <div className="phone-block phone-block-sm">
              <h4>Due date</h4>
              <p>15 Mar 2026</p>
            </div>
          </div>

          <div className="phone-block phone-warning">
            <h4>Warning</h4>
            <p>Late fee may apply after the due date.</p>
          </div>

          <div className="phone-block">
            <h4>Next step</h4>
            <p>Pay before 15 Mar to avoid extra charges.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Home() {
  const { user } = useAuth();

  useEffect(() => {
    const timer = window.setTimeout(scrollToHash, 50);
    window.addEventListener('hashchange', scrollToHash);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('hashchange', scrollToHash);
    };
  }, []);

  const startPath = user ? '/explain' : '/signup';

  return (
    <div className="page home-page">
      <div className="home-shell">
        <Navbar />

        <section className="hero">
          <div className="hero-content reveal">
            <p className="hero-badge">
              <svg
                className="hero-badge-icon"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                {/* Gemini-inspired four-point sparkle */}
                <path
                  d="M12 1.5C12.55 6.2 17.8 11.45 22.5 12C17.8 12.55 12.55 17.8 12 22.5C11.45 17.8 6.2 12.55 1.5 12C6.2 11.45 11.45 6.2 12 1.5Z"
                  fill="currentColor"
                />
              </svg>
              AI Document Explainer
            </p>
            <h1>
              Paperwork, <span>made clear.</span>
            </h1>
            <p className="hero-kicker">
              Understand Your Documents. Make Better Decisions.
            </p>
            <p className="hero-text">
              Bills, notices and agreements are written for lawyers, not for
              you. Samjhao turns them into plain language you can act on.
            </p>
            <div className="hero-actions">
              <Link to={startPath} className="btn btn-primary">
                Try Samjhao →
              </Link>
              {!user && (
                <Link to="/login" className="btn btn-secondary">
                  Log In
                </Link>
              )}
              <a href="#how-it-works" className="btn btn-ghost">
                How It Works
              </a>
            </div>
          </div>

          <div className="hero-visual reveal reveal-delay">
            <PhoneShowcase />
          </div>
        </section>

        <section id="features" className="home-section features-section">
          <div className="home-section-header">
            <h2>
              Built for clarity, <span>not complexity.</span>
            </h2>
            <p>
              Everything you need to understand everyday paperwork — without
              the jargon.
            </p>
          </div>

          <ul className="feature-list">
            <li>Photo Upload</li>
            <li>AI Understanding</li>
            <li>Simple Summaries</li>
            <li>Important Amounts &amp; Dates</li>
            <li>Warnings Flagged</li>
            <li>Clear Next Steps</li>
            <li>Secure Login</li>
            <li>Document History</li>
          </ul>
        </section>

        <section id="how-it-works" className="home-section">
          <div className="home-section-header">
            <h2>
              How It <span>Works</span>
            </h2>
            <p>Three simple steps to understand a confusing document.</p>
          </div>

          <div className="steps-grid">
            <article className="step-card">
              <span className="step-number" aria-hidden="true">
                1
              </span>
              <h3>Upload</h3>
              <p>Take a photo of your bill, notice or agreement.</p>
            </article>

            <article className="step-card">
              <span className="step-number" aria-hidden="true">
                2
              </span>
              <h3>Choose Language</h3>
              <p>Pick English, Hindi or Marathi.</p>
            </article>

            <article className="step-card">
              <span className="step-number" aria-hidden="true">
                3
              </span>
              <h3>Understand</h3>
              <p>Get a simple summary, key dates and next steps.</p>
            </article>
          </div>
        </section>

        <section id="privacy" className="home-section home-section-privacy">
          <div className="home-section-header">
            <h2>
              Privacy, <span>explained clearly.</span>
            </h2>
            <p>Honest details about how Samjhao handles your information.</p>
          </div>

          <div className="privacy-card">
            <ul className="privacy-list">
              <li>
                When you upload a document, Samjhao processes it to create a
                clear explanation for you.
              </li>
              <li>
                After a successful explanation, the written result is saved in
                your account history so you can open it later.
              </li>
              <li>
                Each saved explanation is linked to the signed-in user who
                created it.
              </li>
              <li>
                You can view your own saved explanations from History. Other
                users cannot open your documents.
              </li>
              <li>
                Your password is stored as a secure bcrypt hash — never as plain
                text.
              </li>
              <li>
                After you log in, Samjhao uses a JWT (a secure login token) to
                keep your session protected while you use the app.
              </li>
            </ul>
          </div>
        </section>

        <section className="final-cta">
          <h2>Start understanding your documents.</h2>
          <p>
            Create an account, upload a photo, and get a plain-language
            explanation in minutes.
          </p>
          <Link to={startPath} className="btn btn-primary">
            {user ? 'Explain a Document' : 'Get Started'}
          </Link>
        </section>
      </div>

      <Footer />
    </div>
  );
}

export default Home;
