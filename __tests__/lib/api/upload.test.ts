/**
 * Unit tests for upload API - network error handling
 * Requirements: 3.4.1, 3.4.3
 */

// Mock XMLHttpRequest
const mockXHR = {
  open: jest.fn(),
  send: jest.fn(),
  timeout: 0,
  upload: { addEventListener: jest.fn() },
  addEventListener: jest.fn(),
  status: 0,
  responseText: '',
};

beforeEach(() => {
  jest.clearAllMocks();
  mockXHR.open = jest.fn();
  mockXHR.send = jest.fn();
  mockXHR.timeout = 0;
  mockXHR.upload = { addEventListener: jest.fn() };
  mockXHR.addEventListener = jest.fn();
  mockXHR.status = 0;
  mockXHR.responseText = '';
  (global as any).XMLHttpRequest = jest.fn(() => mockXHR);
});

describe('Upload API - Network Error Handling', () => {
  it('should reject with network error message on connection failure', async () => {
    const { uploadFile } = require('../../../lib/api/upload');
    const file = new File(['test'], 'test.mp3', { type: 'audio/mpeg' });

    const promise = uploadFile(file);

    // Simulate error event
    const errorHandler = mockXHR.addEventListener.mock.calls.find(
      (c: any[]) => c[0] === 'error'
    )?.[1];
    expect(errorHandler).toBeDefined();
    errorHandler();

    await expect(promise).rejects.toThrow('ネットワークエラーが発生しました');
  });

  it('should reject with timeout message on timeout', async () => {
    const { uploadFile } = require('../../../lib/api/upload');
    const file = new File(['test'], 'test.mp3', { type: 'audio/mpeg' });

    const promise = uploadFile(file);

    const timeoutHandler = mockXHR.addEventListener.mock.calls.find(
      (c: any[]) => c[0] === 'timeout'
    )?.[1];
    expect(timeoutHandler).toBeDefined();
    timeoutHandler();

    await expect(promise).rejects.toThrow('アップロードがタイムアウトしました');
  });

  it('should resolve with parsed response on success', async () => {
    const { uploadFile } = require('../../../lib/api/upload');
    const file = new File(['test'], 'test.mp3', { type: 'audio/mpeg' });

    const promise = uploadFile(file);

    mockXHR.status = 200;
    mockXHR.responseText = JSON.stringify({
      job_id: '123',
      filename: 'test.mp3',
      status: 'UPLOADED',
      original_file_type: 'audio',
    });

    const loadHandler = mockXHR.addEventListener.mock.calls.find(
      (c: any[]) => c[0] === 'load'
    )?.[1];
    expect(loadHandler).toBeDefined();
    loadHandler();

    const result = await promise;
    expect(result.job_id).toBe('123');
    expect(result.filename).toBe('test.mp3');
  });

  it('should reject with API error detail on server error', async () => {
    const { uploadFile } = require('../../../lib/api/upload');
    const file = new File(['test'], 'test.mp3', { type: 'audio/mpeg' });

    const promise = uploadFile(file);

    mockXHR.status = 400;
    mockXHR.responseText = JSON.stringify({
      detail: 'ファイルサイズが200MBを超えています',
    });

    const loadHandler = mockXHR.addEventListener.mock.calls.find(
      (c: any[]) => c[0] === 'load'
    )?.[1];
    loadHandler();

    await expect(promise).rejects.toThrow('ファイルサイズが200MBを超えています');
  });
});
