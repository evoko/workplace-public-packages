import { describe, expect, it } from 'vitest';
import { nodeVersionProblem, pinnedMajor } from '../src/util/node-version.mjs';

describe('the Node the generator needs', () => {
  it('is the major .nvmrc pins', () => {
    expect(pinnedMajor()).toBe(22);
  });

  it('passes on this Node, and on a newer one', () => {
    expect(nodeVersionProblem()).toBeNull();
    expect(nodeVersionProblem('24.1.0', 22)).toBeNull();
  });

  it('says in one line what is wrong on an older one', () => {
    expect(nodeVersionProblem('20.20.0', 22)).toBe(
      'SOLAR codegen needs Node 22 (.nvmrc); this is 20.20.0',
    );
  });
});
