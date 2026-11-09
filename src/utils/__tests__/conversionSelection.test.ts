import { remapItemErrorIndices, selectedRowIndices } from '@/utils/conversionSelection';

describe('selectedRowIndices', () => {
  it('returns the row index of each selected line, in order', () => {
    const items = [
      { selected: false },
      { selected: true },
      { selected: false },
      { selected: true },
    ];

    expect(selectedRowIndices(items)).toEqual([1, 3]);
  });

  it('returns an empty array when nothing is selected', () => {
    expect(selectedRowIndices([{ selected: false }, { selected: false }])).toEqual([]);
  });

  it('returns every index when all lines are selected', () => {
    expect(selectedRowIndices([{ selected: true }, { selected: true }])).toEqual([0, 1]);
  });
});

describe('remapItemErrorIndices', () => {
  it('maps payload positions back to on-screen row indices', () => {
    // Rows 1 and 3 were submitted, so the API's items.0 / items.1 are rows 1 / 3.
    const errors = {
      'items.0.quantity': ['The quantity field must be at least 0.0001.'],
      'items.1.unit_price': ['The unit price must be less than the invoiced price.'],
    };

    expect(remapItemErrorIndices(errors, [1, 3])).toEqual({
      'items.1.quantity': ['The quantity field must be at least 0.0001.'],
      'items.3.unit_price': ['The unit price must be less than the invoiced price.'],
    });
  });

  it('leaves keys untouched when every row was submitted', () => {
    const errors = { 'items.2.dispatched_quantity': ['Required.'] };

    expect(remapItemErrorIndices(errors, [0, 1, 2])).toEqual(errors);
  });

  it('passes through non-item keys and the bare items key', () => {
    const errors = {
      customer_id: ['The customer field is required.'],
      items: ['Insufficient stock for Product A.'],
    };

    expect(remapItemErrorIndices(errors, [1])).toEqual(errors);
  });

  it('keeps a key whose payload position has no matching row', () => {
    const errors = { 'items.5.quantity': ['Required.'] };

    expect(remapItemErrorIndices(errors, [0, 1])).toEqual(errors);
  });
});
