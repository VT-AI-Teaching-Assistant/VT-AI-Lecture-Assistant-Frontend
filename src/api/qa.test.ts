/**
 * @jest-environment node
 */
import { describe, expect, it } from '@jest/globals';
import { ReadableStream } from 'stream/web';
import { TextDecoder, TextEncoder } from 'util';
import { readSseStream } from './qa';

// Jest 27's node environment doesn't expose these browser globals; Node has them.
Object.assign(globalThis, { ReadableStream, TextDecoder, TextEncoder });

/** A ReadableStream that delivers the given strings as separate chunks. */
function streamOf(chunks: string[]): globalThis.ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      chunks.forEach((c) => controller.enqueue(encoder.encode(c)));
      controller.close();
    },
  }) as unknown as globalThis.ReadableStream<Uint8Array>;
}

async function collect(chunks: string[]): Promise<Array<[string, string]>> {
  const events: Array<[string, string]> = [];
  await readSseStream(streamOf(chunks), (event, data) => events.push([event, data]));
  return events;
}

describe('readSseStream', () => {
  it('parses events in the order they arrive', async () => {
    expect(await collect([
      'event:meta\ndata:{"rid":"q-1","sources":[]}\n\n',
      'event:delta\ndata:{"text":"Hello"}\n\n',
      'event:done\ndata:{"stopReason":"end_turn"}\n\n',
    ])).toEqual([
      ['meta', '{"rid":"q-1","sources":[]}'],
      ['delta', '{"text":"Hello"}'],
      ['done', '{"stopReason":"end_turn"}'],
    ]);
  });

  it('reassembles events split across chunks', async () => {
    expect(await collect(['event: del', 'ta\nda', 'ta: {"text":"a', 'b"}\n', '\nevent: done\ndata: {}\n\n'])).toEqual([
      ['delta', '{"text":"ab"}'],
      ['done', '{}'],
    ]);
  });

  it('accepts CRLF line endings and both "data:" spacings', async () => {
    expect(await collect(['event: delta\r\ndata: {"text":"x"}\r\n\r\n', 'event:delta\ndata:{"text":"y"}\n\n'])).toEqual([
      ['delta', '{"text":"x"}'],
      ['delta', '{"text":"y"}'],
    ]);
  });

  it('joins multi-line data and defaults the event name to "message"', async () => {
    expect(await collect(['data: line 1\ndata: line 2\n\n'])).toEqual([['message', 'line 1\nline 2']]);
  });

  it('delivers a final event without a trailing blank line', async () => {
    expect(await collect(['event: done\ndata: {}'])).toEqual([['done', '{}']]);
  });

  it('ignores comments and blocks without data', async () => {
    expect(await collect([': keep-alive\n\nevent: ping\n\nevent: delta\ndata: {"text":"z"}\n\n'])).toEqual([
      ['delta', '{"text":"z"}'],
    ]);
  });
});
