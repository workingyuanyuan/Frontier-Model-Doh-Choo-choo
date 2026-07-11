import { createDatabase } from './client.js';
import { dimensionSeed, themePresetSeed } from './seed-data.js';
import { dimensions, themePresets } from './schema/index.js';

const { db, pool } = createDatabase();

try {
  await db.transaction(async (transaction) => {
    await transaction
      .insert(dimensions)
      .values([...dimensionSeed])
      .onConflictDoNothing({ target: dimensions.id });

    await transaction
      .insert(themePresets)
      .values([...themePresetSeed])
      .onConflictDoNothing({ target: themePresets.slug });
  });

  console.info(
    `Seeded ${dimensionSeed.length} dimensions and ${themePresetSeed.length} themes.`,
  );
} finally {
  await pool.end();
}
