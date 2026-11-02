import { useEffect, useRef, useState } from 'react';
import Sidebar from './Sidebar';
import {
  handleFileSelect,
  handleFileClear,
  handleExplainSubmit,
} from '../controllers/explainController';
import { revokePreviewUrl } from '../models/documentModel';

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

function ExplainDocument() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [language, setLanguage] = useState('Marathi');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    return () => revokePreviewUrl(previewUrl);
  }, [previewUrl]);

  const fileState = {
    file,
    language,
    previewUrl,
    loading,
    setFile,
    setPreviewUrl,
    setMessage,
    setError,
    setResult,
    setLoading,
    inputRef,
  };

  const onDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    if (loading) return;
    handleFileSelect(event.dataTransfer.files?.[0], fileState);
  };

  return (
    <div className="explain-page">
      <Sidebar />

      <main className="explain-main">
        <div className="explain-layout">
          <form
            className="explain-card"
            onSubmit={(event) => handleExplainSubmit(event, fileState)}
          >
            <div className="explain-header">
              <h1>Explain a Document</h1>
              <p>Upload a photo of a bill, bank notice or agreement</p>
            </div>

            <div
              className={`upload-zone${dragging ? ' is-dragging' : ''}${previewUrl ? ' has-preview' : ''}`}
              onDragOver={(event) => {
                event.preventDefault();
                if (!loading) setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => {
                if (!loading) inputRef.current?.click();
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (loading) return;
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  inputRef.current?.click();
                }
              }}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                disabled={loading}
                onChange={(event) =>
                  handleFileSelect(event.target.files?.[0], fileState)
                }
              />

              {previewUrl ? (
                <div className="upload-preview">
                  <img src={previewUrl} alt="Selected document preview" />
                  <p>{file?.name}</p>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    disabled={loading}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleFileClear(fileState);
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <p className="upload-title">
                    Drag &amp; drop an image here, or click to upload
                  </p>
                  <p className="upload-hint">JPG, PNG or WebP • Max 10 MB</p>
                </>
              )}
            </div>

            {error && <p className="form-error">{error}</p>}

            <label className="field">
              Choose Language
              <select
                value={language}
                disabled={loading}
                onChange={(event) => setLanguage(event.target.value)}
              >
                <option value="Marathi">Marathi (मराठी)</option>
                <option value="Hindi">Hindi (हिन्दी)</option>
                <option value="English">English</option>
              </select>
            </label>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? 'Explaining… please wait' : 'Explain with AI ✨'}
            </button>

            {loading && (
              <p className="form-message">
                Gemini is reading your document. Please wait — this can take a few minutes…
              </p>
            )}

            {!loading && message && !error && (
              <p className="form-message">{message}</p>
            )}
          </form>

          {result && (
            <section className="explain-card result-card" aria-live="polite">
              <div className="explain-header">
                <h2>Explanation</h2>
                <p>{result.documentType || 'Document'}</p>
              </div>

              <section className="result-section">
                <h3>Summary</h3>
                <p>{result.summary || 'No summary available.'}</p>
              </section>

              <ResultList title="Amounts" items={result.amounts} />
              <ResultList title="Dates" items={result.dates} />
              <ResultList title="What You Should Do" items={result.actionSteps} />
              <ResultList title="Warnings" items={result.warnings} />
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default ExplainDocument;
