import { describe, expect, it } from '@jest/globals';
import axios from 'axios';

import { generateExpiredToken, generateToken, generateTokenWithWrongSecret } from './util';

const baseUrl = 'http://localhost:3000';

describe('/files', () => {
  describe('auth', () => {
    it('should return a 200 if a valid token is provided', async () => {
      const token = generateToken();
      const res = await axios.get(`${baseUrl}/files`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      expect(res.status).toBe(200);
    });

    it('should return a 200 "Bearer" is missing', async () => {
      const token = generateToken();
      const res = await axios.get(`${baseUrl}/files`, {
        headers: {
          Authorization: `${token}`,
        },
      });

      expect(res.status).toBe(200);
    });

    it('should return a 401 if no token is provided', async () => {
      expect.assertions(1);
      try {
        await axios.get(`${baseUrl}/files`);
      } catch (e) {
        expect(e.response.status).toBe(401);
      }
    });

    it('should return a 401 if the token is expired', async () => {
      const token = generateExpiredToken();

      try {
        await axios.get(`${baseUrl}/files`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (e) {
        expect(e.response.status).toBe(401);
      }
    });

    it('should return a 401 if the wrong secret is used', async () => {
      const token = generateTokenWithWrongSecret();

      try {
        await axios.get(`${baseUrl}/files`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (e) {
        expect(e.response.status).toBe(401);
      }
    });
  });
});
