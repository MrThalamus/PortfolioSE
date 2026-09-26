import type { Prisma } from "@prisma/client";

// Keeps each section's `order` values a clean 0, 1, 2… sequence, so the number
// an admin types is the item's position (0 = top):
//  - adding an item at position N moves everything at N or later down one;
//  - moving an item shifts the items it passes over;
//  - deleting an item closes the gap it leaves.
// Must run inside the same transaction as the create/update/delete.

type OrderedTable =
  | "Project"
  | "Achievement"
  | "Certificate"
  | "BeyondAcademicsEntry"
  | "Involvement"
  | "ResearchItem"
  | "Photo"
  | "GalleryImage";

type Tx = Prisma.TransactionClient;

// Table names come from the fixed union above (never user input), so
// interpolating them into the SQL is safe; values are always parameters.

async function countRows(tx: Tx, table: OrderedTable): Promise<number> {
  const [{ count }] = await tx.$queryRawUnsafe<{ count: bigint }[]>(`SELECT COUNT(*) AS count FROM "${table}"`);
  return Number(count);
}

/** Frees up `position` for a new item and returns the position to save it at. */
export async function makeRoomForInsert(tx: Tx, table: OrderedTable, position: number): Promise<number> {
  const target = Math.min(Math.max(0, position), await countRows(tx, table)); // past the end = last
  await tx.$executeRawUnsafe(`UPDATE "${table}" SET "order" = "order" + 1 WHERE "order" >= $1`, target);
  return target;
}

/** Shifts the items between an item's old and new position; returns the position to save it at. */
export async function makeRoomForMove(
  tx: Tx,
  table: OrderedTable,
  id: string,
  from: number,
  requested: number
): Promise<number> {
  const to = Math.min(Math.max(0, requested), (await countRows(tx, table)) - 1); // past the end = last
  if (to < from) {
    await tx.$executeRawUnsafe(
      `UPDATE "${table}" SET "order" = "order" + 1 WHERE "order" >= $1 AND "order" < $2 AND "id" <> $3`,
      to,
      from,
      id
    );
  } else if (to > from) {
    await tx.$executeRawUnsafe(
      `UPDATE "${table}" SET "order" = "order" - 1 WHERE "order" > $1 AND "order" <= $2 AND "id" <> $3`,
      from,
      to,
      id
    );
  }
  return to;
}

export async function closeGapAfterDelete(tx: Tx, table: OrderedTable, position: number) {
  await tx.$executeRawUnsafe(`UPDATE "${table}" SET "order" = "order" - 1 WHERE "order" > $1`, position);
}
