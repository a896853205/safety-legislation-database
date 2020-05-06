import secondTableOption from '../second-table-option';
import assert = require('assert');

describe('Function secondTableOption', () => {
  it('first table and second table combine', () => {
    assert(secondTableOption(20, 14, 2).offset === 0);
    assert(secondTableOption(20, 14, 2).limit === 8);
  });

  it('only two table', () => {
    assert(secondTableOption(20, 14, 3).offset === 6);
    assert(secondTableOption(20, 14, 3).limit === 14);
  });

  it('pageSize too large', () => {
    assert(secondTableOption(20, 500, 1).offset === 0);
    assert(secondTableOption(20, 500, 1).limit === 480);
  });

  it('pageSize too large2', () => {
    assert(secondTableOption(20, 500, 2).offset === 520);
    assert(secondTableOption(20, 500, 2).limit === 500);
  });
});
