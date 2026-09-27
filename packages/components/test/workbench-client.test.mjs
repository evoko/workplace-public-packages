/**
 * The workbench bar's HTTP client (stories/workbench/client.ts): what it throws for an answer it
 * cannot read, in the same words as Widgetbook's client.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { WorkbenchRefusal, httpClient } from '../stories/workbench/client.ts';

/** Stubs fetch with one answer: its status and its body as text. */
const answer = (status, text) =>
  vi
    .spyOn(globalThis, 'fetch')
    .mockResolvedValue(new Response(text, { status }));

afterEach(() => vi.restoreAllMocks());

describe('the workbench client', () => {
  it('returns a JSON answer', async () => {
    answer(200, '{"busy":null,"pending":null,"components":{}}');
    await expect(httpClient().status()).resolves.toEqual({
      busy: null,
      pending: null,
      components: {},
    });
  });

  it('throws the service’s sentence for an error, with its status', async () => {
    answer(409, '{"error":"Button has no pending edit"}');
    const e = await httpClient()
      .undo('Button')
      .catch((x) => x);
    expect(e).toBeInstanceOf(WorkbenchRefusal);
    expect(e.status).toBe(409);
    expect(e.message).toBe('Button has no pending edit');
  });

  it('names the status for an error with no sentence', async () => {
    answer(500, '{}');
    await expect(httpClient().status()).rejects.toThrow(
      'the workbench answered 500',
    );
  });

  it('throws for a body that is not JSON, a 2xx one too', async () => {
    answer(502, '<html>Bad Gateway</html>');
    await expect(httpClient().status()).rejects.toThrow(
      'the workbench answered 502',
    );
    answer(200, 'not json');
    const e = await httpClient()
      .status()
      .catch((x) => x);
    expect(e).toBeInstanceOf(WorkbenchRefusal);
    expect(e.message).toBe('the workbench answered 200');
  });
});
