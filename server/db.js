const knex = require('knex');
const path = require('path');

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: path.join(__dirname, 'notes.sqlite')
  },
  useNullAsDefault: true
});

const initDb = async () => {
  // Users table
  if (!(await db.schema.hasTable('users'))) {
    await db.schema.createTable('users', (table) => {
      table.increments('id').primary();
      table.string('email').unique().notNullable();
      table.string('password').notNullable();
      table.timestamps(true, true);
    });
  }

  // Notes table (update or create)
  if (!(await db.schema.hasTable('notes'))) {
    await db.schema.createTable('notes', (table) => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().references('id').inTable('users');
      table.string('title').notNullable();
      table.text('content').notNullable();
      table.timestamps(true, true);
    });
  } else {
    // Add user_id if it doesn't exist
    const hasUserId = await db.schema.hasColumn('notes', 'user_id');
    if (!hasUserId) {
      await db.schema.table('notes', (table) => {
        table.integer('user_id').unsigned().references('id').inTable('users');
      });
    }
  }

  // Tags table
  if (!(await db.schema.hasTable('tags'))) {
    await db.schema.createTable('tags', (table) => {
      table.increments('id').primary();
      table.string('name').unique().notNullable();
    });
  }

  // Note Tags junction
  if (!(await db.schema.hasTable('note_tags'))) {
    await db.schema.createTable('note_tags', (table) => {
      table.integer('note_id').unsigned().references('id').inTable('notes').onDelete('CASCADE');
      table.integer('tag_id').unsigned().references('id').inTable('tags').onDelete('CASCADE');
      table.primary(['note_id', 'tag_id']);
    });
  }

  // Versions table
  if (!(await db.schema.hasTable('note_versions'))) {
    await db.schema.createTable('note_versions', (table) => {
      table.increments('id').primary();
      table.integer('note_id').unsigned().references('id').inTable('notes').onDelete('CASCADE');
      table.text('content').notNullable();
      table.timestamp('created_at').defaultTo(db.fn.now());
    });
  }
  
  console.log('Database schema updated');
};

module.exports = { db, initDb };
