import oracle from '../../../../../spec/verify/token-input.json';
import { TokenInput, type TokenInputProps } from '../../../src/TokenInput.js';
import type { OracleVariant, VisualCase } from './types.js';

/** The Tags Figma draws in the variant, in its order. */
const tags = (v: OracleVariant) =>
  ['tag', 'tag2'].filter((l) => v.layers?.[l] && !v.layers[l]?.hidden);

// Figma's words, and as many entries as the variant draws Tags, each marked with its layer, one
// more where it draws the Counter of the rest; typing Figma's words where it draws it active.
export default {
  oracle,
  render: (v) => {
    const drawn = tags(v);
    const counted = v.layers?.counter && !v.layers.counter.hidden;
    return (
      <TokenInput
        {...(v.props as Pick<
          TokenInputProps,
          'size' | 'disabled' | 'error' | 'readonly'
        >)}
        label="Label"
        mandatory
        helper="Helper text"
        value={[...drawn.map(() => 'Label'), ...(counted ? ['More'] : [])]}
        maxVisible={drawn.length}
        getTagProps={(_, i) => ({ 'data-layer': drawn[i] })}
        inputValue={v.content?.includes('inputValue') ? 'Add items…' : ''}
        onInputChange={() => {}}
        placeholder="Add items…"
      />
    );
  },
} satisfies VisualCase;
