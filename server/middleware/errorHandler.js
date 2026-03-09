// ============================================================
// middleware/errorHandler.js
// ============================================================

export function errorHandler(err, _req, res, _next) {
  const status  = err.status ?? err.statusCode ?? 500;
  const message = err.message ?? 'Internal Server Error';

  if (status >= 500) {
    console.error(`[ERROR] ${err.stack ?? message}`);
  }

  res.status(status).json({
    error:   message,
    code:    err.code   ?? null,
    details: err.details ?? null,
  });
}
