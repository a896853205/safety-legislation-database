import assert from 'assert';
import havePropNumber from './have-prop-number';

describe('have-prop-number', () => {
  it('Array is empty', () => {
    assert.equal(havePropNumber([], ''), 0);
  });

  it('prop name in object', () => {
    assert.equal(
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
      ),
      2
    );
  });
});
