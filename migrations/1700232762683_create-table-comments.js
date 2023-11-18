exports.up = (pgm) => {
  pgm.createTable('comments', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    content: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    date_created: {
      type: 'TEXT',
      notNull: true,
    },
    is_delete: {
      type: 'boolean',
      default: false,
    },
    owner_id: {
      type: 'VARCHAR(50)',
      references: 'users(id)',
      notNull: true,
      onDelete: 'CASCADE',
    },
    thread_id: {
      type: 'VARCHAR(50)',
      references: 'threads(id)',
      notNull: true,
      onDelete: 'CASCADE',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('comments');
};
