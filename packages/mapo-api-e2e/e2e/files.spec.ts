import { describe, it, expect, beforeAll } from '@jest/globals';
import { Chance } from 'chance';
import axios, { Axios } from 'axios';

import { generateToken, jwtSubject } from './util';
import { MAPO_API_BASE_URL } from './config';

const chance = new Chance();

describe('Files API', () => {
    let client: Axios;
    let token;
    beforeAll(() => {
        token = generateToken();
        client = axios.create({
            baseURL: MAPO_API_BASE_URL,
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
    });

    it('create file', async () => {
        const file = {
            name: chance.word(),
            contentBase64: Buffer.from(JSON.stringify({})).toString('base64'),
        };

        // When I insert a file
        const res = await client.request({
            method: 'POST',
            url: '/files',
            data: file 
        });

        // Then it should be returned in the response
        expect(res.data).toEqual({
            id: expect.any(Number),
            userId: jwtSubject,
            name: file.name,
            contentBase64: file.contentBase64,
        })
    });

    it('list files', async () => {
        const file = {
            name: chance.word(),
            contentBase64: Buffer.from(JSON.stringify({})).toString('base64'),
        };

        // Given I have inserted a file
        let res = await client.request({
            method: 'POST',
            url: '/files',
            data: file 
        });

        // Then it should appear in the GET /files response
        res = await client.request({
            method: 'GET',
            url: '/files',
        })

        const found = res.data.find(f => f.name === file.name && f.contentBase64 === file.contentBase64);
        expect(found).toBeTruthy();
    });

    it('get file', async () => {
        const file = {
            name: chance.word(),
            contentBase64: Buffer.from(JSON.stringify({})).toString('base64'),
        };

        // Given I have inserted a file
        let res = await client.request({
            method: 'POST',
            url: '/files',
            data: file 
        });
        const fileId = res.data.id;

        // Then I should be able to retrieve it by id
        res = await client.request({
            method: 'GET',
            url: `/files/${fileId}`,
        });

        expect(res.data.id).toBe(fileId);
        expect(res.data.name).toBe(file.name);
    });

    it('delete file', async () => {
        const file = {
            name: chance.word(),
            contentBase64: Buffer.from(JSON.stringify({})).toString('base64'),
        };

        // Given I have inserted a file
        let res = await client.request({
            method: 'POST',
            url: '/files',
            data: file 
        });
        const fileId = res.data.id;

        // When I delete that file
        await client.request({
            method: 'DELETE',
            url: `/files/${fileId}`,
        });

        // Then it should not appear in the list response
        res = await client.request({
            method: 'GET',
            url: '/files',
        })
        const ids = res.data.map(f => f.id);
        expect(ids).not.toContain(fileId);
    })

    it('update file name', async () => {
        const file = {
            name: chance.word(),
            contentBase64: Buffer.from(JSON.stringify({})).toString('base64'),
        };

        // Given I have inserted a file
        let res = await client.request({
            method: 'POST',
            url: '/files',
            data: file 
        });
        const fileId = res.data.id;


        // When I call PATCH and give a new name
        res = await client.request({
            method: 'PATCH',
            url: `/files/${fileId}`,
            data: {
                name: 'new name',
            }
        });

        // Then the name should be updated
        res = await client.request({
            method: 'GET',
            url: `/files/${fileId}`,
        });
        expect(res.data.name).toBe('new name');

        // Then other fields should be unaffected
        expect(res.data.contentBase64).toBe(file.contentBase64);
    });

    it('update file contentBase64', async () => {
        const file = {
            name: chance.word(),
            contentBase64: Buffer.from(JSON.stringify({})).toString('base64'),
        };

        // Given I have inserted a file
        let res = await client.request({
            method: 'POST',
            url: '/files',
            data: file 
        });
        const fileId = res.data.id;


        // When I call PATCH and give a new name
        res = await client.request({
            method: 'PATCH',
            url: `/files/${fileId}`,
            data: {
                contentBase64: Buffer.from(JSON.stringify({new: 'content'})).toString('base64'),
            }
        });

        // Then the name should be updated
        res = await client.request({
            method: 'GET',
            url: `/files/${fileId}`,
        });
        expect(res.data.contentBase64).toBe(Buffer.from(JSON.stringify({new: 'content'})).toString('base64'));

        // Then other fields should be unaffected
        expect(res.data.name).toBe(file.name);
    });


    it('only returns my files', async () => {
        const userIdA = 'AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA'
        const userIdB = 'BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBBBBBB'
        const tokenA = generateToken(userIdA);
        const tokenB = generateToken(userIdB);

        // Given a file exists, from user A
        let res = await client.request({
            method: 'POST',
            url: '/files',
            headers: {
                Authorization: `Bearer ${tokenA}`,
            },
            data: {
                name: 'file from user A',
                contentBase64: Buffer.from(JSON.stringify({})).toString('base64'),
            }
        });
        const fileId = res.data.id;

        // When user B lists files
        res = await client.request({
            method: 'GET',
            url: '/files',
            headers: {
                Authorization: `Bearer ${tokenB}`,
            },
        });

        // Then the file from user A should not be in the list
        const ids = res.data.map(f => f.id);
        expect(ids).not.toContain(fileId);
    })

    it('cannot get someone elses file', async () => {
        const userIdA = 'AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA'
        const userIdB = 'BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBBBBBB'
        const tokenA = generateToken(userIdA);
        const tokenB = generateToken(userIdB);

        // Given a file exists, from user A
        let res = await client.request({
            method: 'POST',
            url: '/files',
            headers: {
                Authorization: `Bearer ${tokenA}`,
            },
            data: {
                name: 'file from user A',
                contentBase64: Buffer.from(JSON.stringify({})).toString('base64'),
            }
        });
        const fileId = res.data.id;

        // When user B tries to get it
        res = await client.request({
            method: 'GET',
            url: `/files/${fileId}`,
            headers: {
                Authorization: `Bearer ${tokenB}`,
            },
            validateStatus: () => true,
        });

        // Then they get a 404
        expect(res.status).toEqual(404);
    })

    it('cannot delete someone elses files', async () => {
        const userIdA = 'AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA'
        const userIdB = 'BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBBBBBB'
        const tokenA = generateToken(userIdA);
        const tokenB = generateToken(userIdB);

        // Given a file exists, from user A
        let res = await client.request({
            method: 'POST',
            url: '/files',
            headers: {
                Authorization: `Bearer ${tokenA}`,
            },
            data: {
                name: 'file from user A',
                contentBase64: Buffer.from(JSON.stringify({})).toString('base64'),
            }
        });
        const fileId = res.data.id;

        // When user B tries to delete it
        res = await client.request({
            method: 'DELETE',
            url: `/files/${fileId}`,
            headers: {
                Authorization: `Bearer ${tokenB}`,
            },
            validateStatus: () => true,
        });

        // Then they get a 404
        expect(res.status).toEqual(404);
    })

    it('cannot patch someone elses files', async () => {
        const userIdA = 'AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA'
        const userIdB = 'BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBBBBBB'
        const tokenA = generateToken(userIdA);
        const tokenB = generateToken(userIdB);

        // Given a file exists, from user A
        let res = await client.request({
            method: 'POST',
            url: '/files',
            headers: {
                Authorization: `Bearer ${tokenA}`,
            },
            data: {
                name: 'file from user A',
                contentBase64: Buffer.from(JSON.stringify({})).toString('base64'),
            }
        });
        const fileId = res.data.id;

        // When user B tries to update id
        res = await client.request({
            method: 'PATCH',
            url: `/files/${fileId}`,
            data: {
                name: 'new name'
            },
            headers: {
                Authorization: `Bearer ${tokenB}`,
            },
            validateStatus: () => true,
        });

        // Then they get a 404
        expect(res.status).toEqual(404);
    })
});