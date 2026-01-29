const missingTableCodes = new Set(['42P01', 'PGRST102', 'PGRST201', 'PGRST203', 'PGRST204', 'PGRST205']);

const trimOrNull = (value) => {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const parseNumber = (value, fallback = null) => {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const isMissingTableError = (error) => {
  if (!error) return false;
  if (missingTableCodes.has(error.code)) {
    return true;
  }

  const message = error.message || error.details;
  if (!message) return false;
  return /relation ".+" does not exist/i.test(message);
};

const respondWithError = (res, error, { defaultMessage = 'An unexpected error occurred', status = 500, fallbackData } = {}) => {
  if (error) {
    const details = {
      message: error.message,
      code: error.code,
      hint: error.hint,
      details: error.details,
    };
    console.error(defaultMessage, details);
  } else {
    console.error(defaultMessage);
  }

  const includeDebug = process.env.NODE_ENV !== 'production';

  if (fallbackData !== undefined) {
    return res.status(status).json({
      success: status >= 200 && status < 400,
      data: fallbackData,
      error: status >= 400 ? defaultMessage : undefined,
    });
  }

  return res.status(status).json({
    success: false,
    error: defaultMessage,
    ...(includeDebug && error
      ? {
          errorDetails: {
            message: error.message,
            code: error.code,
            hint: error.hint,
            details: error.details,
          },
        }
      : {}),
  });
};

module.exports = {
  trimOrNull,
  parseNumber,
  isMissingTableError,
  respondWithError,
};
