import * as jwt from 'jsonwebtoken';

// These env variables should be loaded from infisical
// See the Taskfile.yml for commands
const jwtSecret = process.env.JWT_SECRET ?? '';
const jwtIssuer = process.env.JWT_ISSUER ?? '';
const jwtAudience = process.env.JWT_AUDIENCE ?? '';

const jwtSubject = '11111111-1111-1111-1111-111111111111';
const jwtEmail = 'testuser@bensivo.com';

export function generateToken() {
  const jwtPayload = {
    // NOTE: this is not the full JWT payload
    // but it has all the fields we care about for testing
    aud: jwtAudience,
    exp: Date.now() / 1000 + 60 * 60, // 1 hour from now
    iat: Date.now() / 1000,
    iss: jwtIssuer,
    sub: jwtSubject,
    email: jwtEmail,
  };

  const token = jwt.sign(jwtPayload, jwtSecret, {
    algorithm: 'HS256',
  });
  return token;
}

export function generateExpiredToken() {
  const jwtPayload = {
    aud: jwtAudience,
    exp: Date.now() / 1000 - 60 * 60 * 2, // 2 hours ago
    iat: Date.now() / 1000 - 60 * 60, // 1 hour ago
    iss: jwtIssuer,
    sub: jwtSubject,
    email: jwtEmail,
  };

  const token = jwt.sign(jwtPayload, jwtSecret, {
    algorithm: 'HS256',
  });
  return token;
}

export function generateTokenWithWrongSecret() {
  const jwtPayload = {
    aud: jwtAudience,
    exp: Date.now() / 1000 + 60 * 60, // 1 hour from now
    iat: Date.now() / 1000,
    iss: jwtIssuer,
    sub: jwtSubject,
    email: jwtEmail,
  };

  const token = jwt.sign(jwtPayload, 'not-the-real-secret', {
    algorithm: 'HS256',
  });
  return token;
}
