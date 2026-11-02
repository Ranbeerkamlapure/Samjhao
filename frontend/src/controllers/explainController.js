import {
  validateImageFile,
  createPreviewUrl,
  revokePreviewUrl,
  explainDocument,
  getExplainErrorMessage,
} from '../models/documentModel';

// Handle file chosen by click or drag-and-drop
export function handleFileSelect(file, state) {
  const {
    previewUrl,
    setFile,
    setPreviewUrl,
    setMessage,
    setError,
    setResult,
  } = state;
  const result = validateImageFile(file);

  if (!result.ok) {
    setError(result.error);
    return;
  }

  revokePreviewUrl(previewUrl);
  setError('');
  setMessage('');
  setResult(null);
  setFile(file);
  setPreviewUrl(createPreviewUrl(file));
}

export function handleFileClear(state) {
  const {
    previewUrl,
    setFile,
    setPreviewUrl,
    setMessage,
    setError,
    setResult,
    inputRef,
  } = state;

  revokePreviewUrl(previewUrl);
  setFile(null);
  setPreviewUrl('');
  setMessage('');
  setError('');
  setResult(null);

  if (inputRef?.current) {
    inputRef.current.value = '';
  }
}

export async function handleExplainSubmit(event, state) {
  event.preventDefault();

  const {
    file,
    language,
    loading,
    setLoading,
    setResult,
    setError,
    setMessage,
  } = state;

  if (loading) {
    return;
  }

  if (!file) {
    setError('Please upload a document image first.');
    setResult(null);
    return;
  }

  setLoading(true);
  setError('');
  setMessage('');
  setResult(null);

  try {
    const data = await explainDocument(file, language);
    setResult(data);
    setMessage('Document explained successfully.');
  } catch (error) {
    setResult(null);
    setError(getExplainErrorMessage(error));
  } finally {
    setLoading(false);
  }
}
