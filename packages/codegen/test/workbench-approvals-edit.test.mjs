import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import {
  approvalsFile,
  pasteFor,
  readApprovals,
} from '../src/approvals/status.mjs';
import {
  withApproval,
  withdrawnBy,
  withoutApprovals,
} from '../src/workbench/approvals-edit.mjs';

const HEADER =
  '# Which SOLAR components a person has approved.\n#\n# Button:\n#   web: { … }\n';
const line = { fingerprint: 'sha256:abc', by: 'A Person', on: '2026-09-27' };

describe('editing approvals', () => {
  it('adds a line under its component, keeping the header, components in name order', () => {
    let out = withApproval(HEADER, 'Dialog', 'web', line);
    out = withApproval(out, 'Button', 'web', line);
    out = withApproval(out, 'Button', 'flutter', {
      ...line,
      fingerprint: 'sha256:def',
    });
    expect(out.startsWith(HEADER)).toBe(true);
    const data = parse(out);
    expect(Object.keys(data)).toEqual(['Button', 'Dialog']);
    expect(data.Button.flutter).toEqual({ ...line, fingerprint: 'sha256:def' });
    expect(out).toMatch(/^ {2}web: \{ fingerprint: /m);
    // The real reader reads it back as the same record.
    expect(readApprovals(out)).toEqual(data);
  });

  it('writes each line exactly as solar:status prints it to paste', () => {
    const out = withApproval(
      withApproval('', 'Confirmation Dialog', 'flutter', line),
      'Confirmation Dialog',
      'web',
      line,
    );
    const coloured = {
      web: [
        {
          name: 'Confirmation Dialog',
          colour: 'yellow',
          fingerprint: 'sha256:abc',
        },
      ],
      flutter: [
        {
          name: 'Confirmation Dialog',
          colour: 'yellow',
          fingerprint: 'sha256:abc',
        },
      ],
    };
    expect(out).toBe(
      `${pasteFor(coloured, { by: 'A Person', on: '2026-09-27' })}\n`,
    );
  });

  it('replaces a platform’s line in place, touching no other line', () => {
    const text = `${HEADER}\nButton:\n  web: { fingerprint: 'sha256:old', by: 'Someone', on: 2026-09-01 }\n  # checked on a phone too\n  flutter: { fingerprint: 'sha256:abc', by: 'Someone', on: 2026-09-01 }\nDialog:\n  web: { fingerprint: 'sha256:abc', by: 'Someone', on: 2026-09-01 }\n`;
    const out = withApproval(text, 'Button', 'web', line);
    expect(out).toBe(
      text.replace(
        "  web: { fingerprint: 'sha256:old', by: 'Someone', on: 2026-09-01 }",
        "  web: { fingerprint: 'sha256:abc', by: 'A Person', on: 2026-09-27 }",
      ),
    );
    expect(readApprovals(out).Button.web).toEqual(line);
  });

  it('removes lines, and a component once nothing is under it', () => {
    let out = withApproval(HEADER, 'Button', 'web', line);
    out = withApproval(out, 'Button', 'flutter', line);
    out = withApproval(out, 'Dialog', 'web', line);
    out = withoutApprovals(out, [
      { name: 'Button', platform: 'web' },
      { name: 'Dialog', platform: 'web' },
    ]);
    expect(parse(out)).toEqual({ Button: { flutter: line } });
    expect(readApprovals(out)).toEqual({ Button: { flutter: line } });
    expect(out.startsWith(HEADER)).toBe(true);
  });

  it('keeps a person’s note with its component, and every other line as it was', () => {
    const text = `${HEADER}\nButton:\n  web: { fingerprint: 'sha256:abc', by: 'Someone', on: 2026-09-01 }\n# Dialog was checked with a screen reader.\nDialog:\n  web: { fingerprint: 'sha256:abc', by: 'Someone', on: 2026-09-01 }\n`;
    const added = withApproval(text, 'Chip', 'web', line);
    expect(added).toBe(
      text.replace(
        '# Dialog',
        "Chip:\n  web: { fingerprint: 'sha256:abc', by: 'A Person', on: 2026-09-27 }\n# Dialog",
      ),
    );
    expect(withoutApprovals(added, [{ name: 'Chip', platform: 'web' }])).toBe(
      text,
    );
    expect(withoutApprovals(text, [{ name: 'Dialog', platform: 'web' }])).toBe(
      text.slice(0, text.indexOf('# Dialog')),
    );
  });

  it('leaves the header exactly as it was once every approval is withdrawn', () => {
    const header = readFileSync(approvalsFile, 'utf8');
    let out = withApproval(header, 'Dialog', 'web', line);
    out = withApproval(out, 'Button', 'web', line);
    out = withApproval(out, 'Button', 'flutter', line);
    expect(readApprovals(out)).toEqual({
      Button: { web: line, flutter: line },
      Dialog: { web: line },
    });
    out = withoutApprovals(out, [
      { name: 'Button', platform: 'web' },
      { name: 'Dialog', platform: 'web' },
      { name: 'Button', platform: 'flutter' },
    ]);
    expect(out).toBe(header);
    expect(readApprovals(out)).toEqual({});
  });

  it('reads a real fingerprint back, the record being outside the Prettier check', () => {
    // spec/approvals.yaml is not Prettier-checked: a line holds a 64-hex fingerprint as
    // solar:status prints it, longer than Prettier's width, so only the reading back is checked.
    const real = {
      ...line,
      fingerprint: `sha256:${'0123456789abcdef'.repeat(4)}`,
    };
    const out = withApproval(HEADER, 'Confirmation Dialog', 'web', real);
    expect(readApprovals(out)).toEqual({
      'Confirmation Dialog': { web: real },
    });
  });

  it('keeps a record with no final newline whole', () => {
    const text = `${HEADER}\nButton:\n  web: { fingerprint: 'sha256:abc', by: 'Someone', on: 2026-09-01 }`;
    const added = withApproval(
      withApproval(text, 'Chip', 'web', line),
      'Button',
      'flutter',
      line,
    );
    expect(readApprovals(added)).toEqual({
      Button: {
        web: { fingerprint: 'sha256:abc', by: 'Someone', on: '2026-09-01' },
        flutter: line,
      },
      Chip: { web: line },
    });
    expect(added.startsWith(`${text}\n`)).toBe(true);
    expect(withoutApprovals(text, [{ name: 'Button', platform: 'web' }])).toBe(
      HEADER,
    );
    expect(
      readApprovals(
        withoutApprovals(
          `${text}\n  flutter: { fingerprint: 'sha256:abc', by: 'Someone', on: 2026-09-01 }`,
          [{ name: 'Button', platform: 'web' }],
        ),
      ),
    ).toEqual({
      Button: {
        flutter: { fingerprint: 'sha256:abc', by: 'Someone', on: '2026-09-01' },
      },
    });
  });

  it('removes nothing it does not have', () => {
    const out = withApproval(HEADER, 'Button', 'web', line);
    expect(
      withoutApprovals(out, [
        { name: 'Button', platform: 'flutter' },
        { name: 'Dialog', platform: 'web' },
      ]),
    ).toBe(out);
  });

  it('withdrawing Button withdraws every approved component on that platform that uses it', () => {
    const coloured = {
      web: [
        { name: 'Button', uses: [] },
        { name: 'Dialog', uses: ['Button', 'Scrim'] },
        { name: 'Confirmation Dialog', uses: ['Button', 'Dialog', 'Scrim'] },
        { name: 'Scrim', uses: [] },
      ],
    };
    const approvals = {
      Button: { web: line },
      Dialog: { web: line },
      Scrim: { web: line },
    };
    expect(withdrawnBy(coloured, approvals, 'Button', 'web')).toEqual([
      'Button',
      'Dialog',
    ]);
  });
});
