import { describe, expect, it, beforeAll } from '@jest/globals';
import axios, { Axios } from 'axios';
import { MAPO_API_BASE_URL } from './config';

import { generateExpiredToken, generateToken, generateTokenWithWrongSecret } from './util';

describe('auth', () => {
  let client: Axios;
  let token;

  beforeAll(() => {
    token = generateToken();
    client = axios.create({
      baseURL: MAPO_API_BASE_URL,
    });
  });

  it('should return a 200 if a valid token is provided', async () => {
    const res = await client.request({
      method: 'GET',
      url: '/files',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect(res.status).toBe(200);
  });

  it('should return a 200 "Bearer" is missing', async () => {
    const res = await client.request({
      method: 'GET',
      url: '/files',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(res.status).toBe(200);
  });

  it('should return a 401 if no token is provided', async () => {
    const res = await client.request({
      method: 'GET',
      url: '/files',
      validateStatus: () => true,
    });

    expect(res.status).toBe(401);
  });

  it('should return a 401 if the token is expired', async () => {
    const token = generateExpiredToken();

    const res = await client.request({
      method: 'GET',
      url: '/files',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      validateStatus: () => true,
    });

    expect(res.status).toBe(401);
  });

  it('should return a 401 if the wrong secret is used', async () => {
    const token = generateTokenWithWrongSecret();

    const res = await client.request({
      method: 'GET',
      url: '/files',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      validateStatus: () => true,
    });
    expect(res.status).toBe(401);
  });
});