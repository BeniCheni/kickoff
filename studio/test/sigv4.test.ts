import { describe, expect, it } from 'vitest'
import { sha256Hex, signAwsV4 } from '../storage/sigv4.ts'

const ACCESS_KEY = 'AKIAIOSFODNN7EXAMPLE'
const SECRET = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
const NOW = new Date('2013-05-24T00:00:00.000Z')
const EMPTY = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'

describe('AWS Signature Version 4 published examples', () => {
  it('signs the GET object example', () => {
    const signed = signAwsV4({
      method: 'GET',
      url: new URL('https://examplebucket.s3.amazonaws.com/test.txt'),
      headers: {
        range: 'bytes=0-9',
        'x-amz-content-sha256': EMPTY,
      },
      payloadHash: EMPTY,
      accessKeyId: ACCESS_KEY,
      secretAccessKey: SECRET,
      region: 'us-east-1',
      service: 's3',
      now: NOW,
    })
    expect(signed.canonicalRequest).toBe([
      'GET',
      '/test.txt',
      '',
      'host:examplebucket.s3.amazonaws.com',
      'range:bytes=0-9',
      `x-amz-content-sha256:${EMPTY}`,
      'x-amz-date:20130524T000000Z',
      '',
      'host;range;x-amz-content-sha256;x-amz-date',
      EMPTY,
    ].join('\n'))
    expect(signed.stringToSign.split('\n')[3]).toBe('7344ae5b7ee6c3e7e6b0fe0640412a37625d1fbfff95c48bbb2dc43964946972')
    expect(signed.signature).toBe('f0e8bdb87c964420e857bd35b5d6ed310bd44f0170aba48dd91039c6036bdb41')
    expect(signed.authorization).toBe('AWS4-HMAC-SHA256 Credential=AKIAIOSFODNN7EXAMPLE/20130524/us-east-1/s3/aws4_request,SignedHeaders=host;range;x-amz-content-sha256;x-amz-date,Signature=f0e8bdb87c964420e857bd35b5d6ed310bd44f0170aba48dd91039c6036bdb41')
  })

  it('signs the PUT object example', () => {
    const payload = 'Welcome to Amazon S3.'
    const payloadHash = '44ce7dd67c959e0d3524ffac1771dfbba87d2b6b4b4e99e42034a8b803f8b072'
    expect(sha256Hex(payload)).toBe(payloadHash)
    const signed = signAwsV4({
      method: 'PUT',
      url: new URL('https://examplebucket.s3.amazonaws.com/test$file.text'),
      headers: {
        date: 'Fri, 24 May 2013 00:00:00 GMT',
        'x-amz-content-sha256': payloadHash,
        'x-amz-storage-class': 'REDUCED_REDUNDANCY',
      },
      payloadHash,
      accessKeyId: ACCESS_KEY,
      secretAccessKey: SECRET,
      region: 'us-east-1',
      service: 's3',
      now: NOW,
    })
    expect(signed.canonicalRequest.split('\n')[1]).toBe('/test%24file.text')
    expect(signed.stringToSign.split('\n')[3]).toBe('9e0e90d9c76de8fa5b200d8c849cd5b8dc7a3be3951ddb7f6a76b4158342019d')
    expect(signed.signature).toBe('98ad721746da40c64f1a55b78f14c238d841ea1380cd77a1b5971af0ece108bd')
    expect(signed.authorization).toBe('AWS4-HMAC-SHA256 Credential=AKIAIOSFODNN7EXAMPLE/20130524/us-east-1/s3/aws4_request,SignedHeaders=date;host;x-amz-content-sha256;x-amz-date;x-amz-storage-class,Signature=98ad721746da40c64f1a55b78f14c238d841ea1380cd77a1b5971af0ece108bd')
  })

  it('signs the GET bucket lifecycle example', () => {
    const signed = signAwsV4({
      method: 'GET',
      url: new URL('https://examplebucket.s3.amazonaws.com/?lifecycle'),
      headers: { 'x-amz-content-sha256': EMPTY },
      payloadHash: EMPTY,
      accessKeyId: ACCESS_KEY,
      secretAccessKey: SECRET,
      region: 'us-east-1',
      service: 's3',
      now: NOW,
    })
    expect(signed.canonicalRequest.split('\n')[2]).toBe('lifecycle=')
    expect(signed.signature).toBe('fea454ca298b7da1c68078a5d1bdbfbbe0d65c699e0f91ac7a200a0136783543')
  })

  it('signs the list-objects example', () => {
    const signed = signAwsV4({
      method: 'GET',
      url: new URL('https://examplebucket.s3.amazonaws.com/?max-keys=2&prefix=J'),
      headers: { 'x-amz-content-sha256': EMPTY },
      payloadHash: EMPTY,
      accessKeyId: ACCESS_KEY,
      secretAccessKey: SECRET,
      region: 'us-east-1',
      service: 's3',
      now: NOW,
    })
    expect(signed.canonicalRequest.split('\n')[2]).toBe('max-keys=2&prefix=J')
    expect(signed.signature).toBe('34b48302e7b5fa45bde8084f4b7868a86f0a534bc59db6670ed5711ef69dc6f7')
  })
})
