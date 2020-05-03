import havePropNumber from './have-prop-number';
import assert = require('assert');
describe('have-prop-number', () => {
  it('Array is empty', () => {
    assert(havePropNumber([], '') === 0);
  });

  it('prop name in object', () => {
    assert(
      havePropNumber(
        [
          {
            a: 1,
            b: 2,
          },
          {
            a: 1,
          },
        ],
        'b'
      ) === 2
    );
  });
});
