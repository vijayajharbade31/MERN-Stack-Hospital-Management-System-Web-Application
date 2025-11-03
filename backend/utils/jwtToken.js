export const generateToken = (user, message, statusCode, res) => {
  const token = user.generateJsonWebToken();
  // Determine the cookie name based on the user's role
  const cookieName = user.role === 'Admin' ? 'adminToken' : 'patientToken';
  // Use a sensible default (7 days) if COOKIE_EXPIRE not set or invalid
  const expireDays = Number(process.env.COOKIE_EXPIRE) || 7;
  const expires = new Date(Date.now() + expireDays * 24 * 60 * 60 * 1000);

  res
    .status(statusCode)
    .cookie(cookieName, token, {
      expires,
      httpOnly: true,
    })
    .json({
      success: true,
      message,
      user,
      token,
    });
};

