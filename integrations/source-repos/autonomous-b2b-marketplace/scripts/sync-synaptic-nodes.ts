import { Client } from 'pg';
import fs from 'fs';

async function syncSynapticNodes() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('Error: DATABASE_URL environment variable is not defined.');
    process.exit(1);
  }

  const client = new Client({ connectionString: databaseUrl });
  try {
    await client.connect();

    // Query your paradox registry
    const { rows } = await client.query(`
      SELECT operator_id, type, paradox_definition, resolution_anchor 
      FROM daisyBrainTable 
      ORDER BY operator_id ASC
    `);

    const synapticSeed = {
      system_core: "dAIsy_HaMINJA",
      synaptic_base: {
        total_operators: 88,
        solution_matrix: 105,
        timestamp: new Date().toISOString()
      },
      seed_nodes: rows.map(row => ({
        operator_id: row.operator_id,
        type: row.type, // 'shared' or 'proprietary'
        paradox: row.paradox_definition,
        solution_id: row.resolution_anchor
      }))
    };

    fs.writeFileSync('synaptic-seed.json', JSON.stringify(synapticSeed, null, 2));
    console.log('Synaptic seed file generated successfully.');
  } catch (error) {
    console.error('Error syncing synaptic nodes:', error);
  } finally {
    await client.end();
  }
}

syncSynapticNodes();
