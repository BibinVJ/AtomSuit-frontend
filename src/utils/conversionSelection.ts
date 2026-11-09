/**
 * Helpers for the document conversion screens (SO → DN/SI, PO → GRN/PI), where the
 * user picks which parent lines carry over into the new document.
 */

/**
 * Row indices of the lines that will actually be submitted, in payload order.
 *
 * Deselected lines are left out of the request entirely rather than sent with a zero
 * quantity — the API requires every line it receives to have a real quantity
 * (`min:0.0001`), and a zero-quantity line would otherwise be snapshotted into the
 * document's item_meta and stock movements.
 */
export function selectedRowIndices<T extends { selected: boolean }>(items: T[]): number[] {
  return items.flatMap((item, index) => (item.selected ? [index] : []));
}

/**
 * Translate `items.{n}.field` validation keys from payload positions back to on-screen
 * row indices.
 *
 * Laravel keys item errors by the position within the submitted array. Once the user
 * deselects a line that array is a subset of the rows on screen, so `items.0.quantity`
 * may well describe the third row — without this the red border and message land on the
 * wrong line. Keys that aren't item-indexed are passed through untouched.
 *
 * @param errors    the `errors` object from a 422 response
 * @param rowIndices row index of each submitted line, in payload order
 */
export function remapItemErrorIndices(
  errors: Record<string, string[]>,
  rowIndices: number[]
): Record<string, string[]> {
  const remapped: Record<string, string[]> = {};

  for (const [key, messages] of Object.entries(errors)) {
    const match = /^items\.(\d+)(\..*)?$/.exec(key);
    const rowIndex = match ? rowIndices[Number(match[1])] : undefined;

    if (match && rowIndex !== undefined) {
      remapped[`items.${rowIndex}${match[2] ?? ''}`] = messages;
    } else {
      remapped[key] = messages;
    }
  }

  return remapped;
}
