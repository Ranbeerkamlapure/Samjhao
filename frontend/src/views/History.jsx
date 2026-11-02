import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { fetchDocuments, fetchDocumentById } from '../models/documentModel';

function ResultList({ title, items }) {
  if (!items || items.length === 0) {
    return (
      <section className="result-section">
        <h3>{title}</h3>
        <p className="result-empty">None found</p>
      </section>
    );
  }

  return (
    <section className="result-section">
      <h3>{title}</h3>
      <ul>
        {items.map((item, index) => (
          <li key={`${title}-${index}`}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function formatDate(value) {
  if (!value) return 'Unknown date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return date.toLocaleString();
}

function History() {
  const [documents, setDocuments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    fetchDocuments()
      .then((items) => {
        if (active) {
          setDocuments(items);
          setError('');
        }
      })
      .catch((err) => {
        if (active) {
          setError(
            err.response?.data?.error ||
              'Could not load your document history.'
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const openDocument = async (id) => {
    setDetailLoading(true);
    setError('');

    try {
      const document = await fetchDocumentById(id);
      setSelected(document);
    } catch (err) {
      setSelected(null);
      setError(err.response?.data?.error || 'Could not open this document.');
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="explain-page">
      <Sidebar />

      <main className="explain-main">
        <div className="explain-layout">
          <section className="explain-card">
            <div className="explain-header">
              <h1>Your History</h1>
              <p>Previously analysed documents</p>
            </div>

            {loading && <p className="form-message">Loading history…</p>}

            {!loading && error && !selected && (
              <p className="form-error">{error}</p>
            )}

            {!loading && !error && documents.length === 0 && (
              <p className="result-empty">
                No documents yet. Explain a document to see it here.
              </p>
            )}

            {!loading && documents.length > 0 && (
              <ul className="history-list">
                {documents.map((doc) => (
                  <li key={doc.id}>
                    <button
                      type="button"
                      className={`history-item${selected?.id === doc.id ? ' is-active' : ''}`}
                      onClick={() => openDocument(doc.id)}
                      disabled={detailLoading}
                    >
                      <span className="history-item-name">
                        {doc.originalName || 'Untitled document'}
                      </span>
                      <span className="history-item-meta">
                        {doc.documentType || 'Document'}
                      </span>
                      <span className="history-item-date">
                        {formatDate(doc.createdAt)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {detailLoading && (
            <section className="explain-card result-card">
              <p className="form-message">Loading explanation…</p>
            </section>
          )}

          {!detailLoading && selected && (
            <section className="explain-card result-card" aria-live="polite">
              <div className="explain-header">
                <h2>{selected.documentType || 'Explanation'}</h2>
                <p>
                  {selected.originalName} · {selected.language} ·{' '}
                  {formatDate(selected.createdAt)}
                </p>
              </div>

              {error && <p className="form-error">{error}</p>}

              <section className="result-section">
                <h3>Summary</h3>
                <p>{selected.summary || 'No summary available.'}</p>
              </section>

              <ResultList title="Amounts" items={selected.amounts} />
              <ResultList title="Dates" items={selected.dates} />
              <ResultList
                title="What You Should Do"
                items={selected.actionSteps}
              />
              <ResultList title="Warnings" items={selected.warnings} />
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default History;
