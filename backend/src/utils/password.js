function validatePassword(password, fieldName = 'Password') {
  if (typeof password !== 'string') {
    return `${fieldName} is required.`;
  }

  if (password.length < 12) {
    return `${fieldName} must contain at least 12 characters.`;
  }

  if (!/[A-Z]/.test(password)) {
    return `${fieldName} must contain at least one uppercase letter.`;
  }

  return null;
}

function validateLoginPassword(password) {
  if (typeof password !== 'string' || password.length < 6) {
    return 'Login password must contain at least 6 characters.';
  }

  if (!/^[a-z0-9]+$/.test(password)) {
    return 'Login password can only contain lowercase letters and numbers.';
  }

  if (!/[a-z]/.test(password)) {
    return 'Login password must contain at least one lowercase letter.';
  }

  if (!/\d/.test(password)) {
    return 'Login password must contain at least one number.';
  }

  return null;
}

function validateWithdrawalPassword(password) {
  if (typeof password !== 'string' || password.length < 6) {
    return 'Withdrawal password must contain at least 6 digits.';
  }

  if (!/^\d+$/.test(password)) {
    return 'Withdrawal password can only contain numbers.';
  }

  return null;
}

module.exports = {
  validatePassword,
  validateLoginPassword,
  validateWithdrawalPassword,
};