const sharp = require('sharp');
const mongoose = require('mongoose');
const { GoogleGenAI, ThinkingLevel } = require('@google/genai');
const Document = require('../models/Document');

const ALLOWED_LANGUAGES = ['English', 'Hindi', 'Marathi'];
const MAX_IMAGE_EDGE = 1600; // keeps text readable while shrinking phone photos

function buildPrompt(language) {
  return [
    `Explain this document image in ${language}.`,
    'Return ONLY valid JSON with this shape:',
    '{"documentType":"","summary":"","amounts":[],"dates":[],"actionSteps":[],"warnings":[]}',
    'Rules:',
    '- Use simple everyday words.',
    '- Put only facts clearly visible in the image.',
    '- Never invent amounts, dates, names or account numbers.',
    '- If text is unreadable or missing, say so in warnings. Do not guess.',
    '- Do not give professional legal, medical or financial advice.',
    '- amounts, dates, actionSteps and warnings must be arrays of short strings (not objects).',
    '- Keep summary to 1-2 short sentences. Keep each list brief.',
  ].join('\n');
}

function extractJsonText(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return null;
  }

  let text = rawText.trim();

  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  }

  return text.trim();
}

function normalizeStringList(value) {
  if (!Array.isArray(value)) {
    return null;
  }

  const items = value
    .map((item) => {
      if (typeof item === 'string') {
        return item.trim();
      }

      if (item && typeof item === 'object') {
        const description =
          typeof item.description === 'string' ? item.description.trim() : '';
        const label = typeof item.label === 'string' ? item.label.trim() : '';
        const text = typeof item.text === 'string' ? item.text.trim() : '';
        const val = item.value != null ? String(item.value).trim() : '';

        if ((description || label) && val) {
          return `${description || label}: ${val}`;
        }

        if (text) return text;
        if (val) return val;
        if (description) return description;
      }

      return '';
    })
    .filter(Boolean);

  return items;
}

function validateExplanation(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { ok: false, error: 'Explanation must be a JSON object.' };
  }

  if (typeof data.documentType !== 'string' || typeof data.summary !== 'string') {
    return { ok: false, error: 'Missing or invalid field: documentType/summary' };
  }

  const amounts = normalizeStringList(data.amounts);
  const dates = normalizeStringList(data.dates);
  const actionSteps = normalizeStringList(data.actionSteps);
  const warnings = normalizeStringList(data.warnings);

  if (!amounts || !dates || !actionSteps || !warnings) {
    return {
      ok: false,
      error: 'amounts, dates, actionSteps and warnings must be arrays',
    };
  }

  return {
    ok: true,
    value: {
      documentType: data.documentType.trim(),
      summary: data.summary.trim(),
      amounts,
      dates,
      actionSteps,
      warnings,
    },
  };
}

// Downscale large phone photos; leave already-small images unchanged
async function prepareImage(file) {
  const originalBytes = file.buffer.length;
  const image = sharp(file.buffer, { failOn: 'none' });
  const metadata = await image.metadata();

  const width = metadata.width || 0;
  const height = metadata.height || 0;
  const longestEdge = Math.max(width, height);

  let pipeline = sharp(file.buffer, { failOn: 'none' }).rotate();

  if (longestEdge > MAX_IMAGE_EDGE) {
    pipeline = pipeline.resize({
      width: width >= height ? MAX_IMAGE_EDGE : undefined,
      height: height > width ? MAX_IMAGE_EDGE : undefined,
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  // JPEG is smaller/faster to send while keeping document text readable
  const outputBuffer = await pipeline
    .jpeg({ quality: 75, mozjpeg: true })
    .toBuffer();

  return {
    buffer: outputBuffer,
    mimeType: 'image/jpeg',
    originalBytes,
    processedBytes: outputBuffer.length,
    width,
    height,
  };
}

function msSince(start) {
  return Date.now() - start;
}

async function explainDocument(req, res) {
  const totalStart = Date.now();
  console.log('[explain] request received');

  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No image uploaded. Send a document image in the "image" field.',
      });
    }

    const language = (req.body.language || '').trim();
    if (!ALLOWED_LANGUAGES.includes(language)) {
      return res.status(400).json({
        error: 'Invalid language. Use English, Hindi or Marathi.',
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'Server is missing GEMINI_API_KEY. Add it to backend/.env.',
      });
    }

    const imageStart = Date.now();
    const prepared = await prepareImage(req.file);
    const imageMs = msSince(imageStart);
    console.log(
      `[explain] image processing completed in ${imageMs}ms ` +
        `(${prepared.originalBytes} -> ${prepared.processedBytes} bytes)`
    );

    const modelName = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
    const ai = new GoogleGenAI({ apiKey });
    const base64Image = prepared.buffer.toString('base64');

    console.log(`[explain] Gemini request started (model=${modelName})`);
    const geminiStart = Date.now();

    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        {
          inlineData: {
            mimeType: prepared.mimeType,
            data: base64Image,
          },
        },
        { text: buildPrompt(language) },
      ],
      config: {
        responseMimeType: 'application/json',
        maxOutputTokens: 1024,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.LOW,
        },
      },
    });

    const geminiMs = msSince(geminiStart);
    console.log(`[explain] Gemini response received in ${geminiMs}ms`);

    const rawText = extractJsonText(response.text);
    if (!rawText) {
      return res.status(502).json({
        error: 'Gemini returned an empty response. Please try again.',
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (parseError) {
      return res.status(502).json({
        error: 'Gemini returned malformed JSON. Please try again.',
      });
    }

    const validated = validateExplanation(parsed);
    if (!validated.ok) {
      return res.status(502).json({
        error: `Invalid explanation format: ${validated.error}`,
      });
    }

    // Only persist after a successful Gemini explanation
    if (!req.userId) {
      return res.status(401).json({
        error: 'Access denied. Please log in.',
      });
    }

    let savedDocument;
    try {
      savedDocument = await Document.create({
        user: req.userId,
        originalName: req.file.originalname || 'document',
        documentType: validated.value.documentType,
        language,
        summary: validated.value.summary,
        amounts: validated.value.amounts,
        dates: validated.value.dates,
        actionSteps: validated.value.actionSteps,
        warnings: validated.value.warnings,
      });
    } catch (saveError) {
      console.error('Document save failed:', saveError.message);
      return res.status(500).json({
        error: 'Document was explained but could not be saved. Please try again.',
      });
    }

    const totalMs = msSince(totalStart);
    console.log(
      `[explain] total request duration ${totalMs}ms ` +
        `(image=${imageMs}ms, gemini=${geminiMs}ms, saved=${savedDocument._id})`
    );

    return res.status(200).json({
      ...validated.value,
      id: savedDocument._id,
    });
  } catch (error) {
    console.error('Document explain failed:', error?.message || error);
    console.log(`[explain] total request duration ${msSince(totalStart)}ms (failed)`);

    if (error?.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'Image is too large. Maximum size is 10 MB.',
      });
    }

    const status = error?.status || error?.error?.code;
    if (status === 404) {
      return res.status(502).json({
        error:
          'Configured Gemini model is unavailable. Update GEMINI_MODEL in backend/.env.',
      });
    }

    if (status === 401 || status === 403) {
      return res.status(502).json({
        error: 'Gemini rejected the API key. Check GEMINI_API_KEY in backend/.env.',
      });
    }

    if (status === 503) {
      return res.status(502).json({
        error: 'Gemini is temporarily busy. Please try again in a moment.',
      });
    }

    return res.status(502).json({
      error: 'Failed to explain the document. Please try again later.',
    });
  }
}

function formatDocument(doc) {
  return {
    id: doc._id,
    originalName: doc.originalName,
    documentType: doc.documentType,
    language: doc.language,
    summary: doc.summary,
    amounts: doc.amounts || [],
    dates: doc.dates || [],
    actionSteps: doc.actionSteps || [],
    warnings: doc.warnings || [],
    createdAt: doc.createdAt,
  };
}

// GET /api/documents — list only this user's documents
async function getDocuments(req, res) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        error: 'Access denied. Please log in.',
      });
    }

    const documents = await Document.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .select(
        'originalName documentType language summary amounts dates actionSteps warnings createdAt'
      );

    return res.status(200).json({
      documents: documents.map(formatDocument),
    });
  } catch (error) {
    console.error('Get documents failed:', error.message);
    return res.status(500).json({
      error: 'Could not load document history.',
    });
  }
}

// GET /api/documents/:id — one document owned by this user
async function getDocumentById(req, res) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        error: 'Access denied. Please log in.',
      });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        error: 'Document not found.',
      });
    }

    const document = await Document.findOne({
      _id: id,
      user: req.userId,
    }).select(
      'originalName documentType language summary amounts dates actionSteps warnings createdAt'
    );

    if (!document) {
      return res.status(404).json({
        error: 'Document not found.',
      });
    }

    return res.status(200).json({
      document: formatDocument(document),
    });
  } catch (error) {
    console.error('Get document failed:', error.message);
    return res.status(500).json({
      error: 'Could not load this document.',
    });
  }
}

module.exports = {
  explainDocument,
  getDocuments,
  getDocumentById,
  ALLOWED_LANGUAGES,
};
