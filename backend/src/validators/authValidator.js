function normalizeString(value) {
  return String(value || '').trim();
}

function validateRegisterInput(payload = {}) {
  const name = normalizeString(payload.name);
  const email = normalizeString(payload.email).toLowerCase();
  const password = String(payload.password || '');

  if (!name) {
    return {
      ok: false,
      message: 'Name is required',
    };
  }

  if (!email) {
    return {
      ok: false,
      message: 'Email is required',
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return {
      ok: false,
      message: 'Enter a valid email address',
    };
  }

  if (!password) {
    return {
      ok: false,
      message: 'Password is required',
    };
  }

  if (password.length < 6) {
    return {
      ok: false,
      message: 'Password must be at least 6 characters',
    };
  }

  return {
    ok: true,
    data: {
      name,
      email,
      password,
    },
  };
}

function validateLoginInput(payload = {}) {
  const email = normalizeString(payload.email).toLowerCase();
  const password = String(payload.password || '');

  if (!email) {
    return {
      ok: false,
      message: 'Email is required',
    };
  }

  if (!password) {
    return {
      ok: false,
      message: 'Password is required',
    };
  }

  return {
    ok: true,
    data: {
      email,
      password,
    },
  };
}

module.exports = {
  validateRegisterInput,
  validateLoginInput,
};