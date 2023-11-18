exports.up = (pgm) => {
  pgm.createTable('replies', {
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
    comment_id: {
      type: 'VARCHAR(50)',
      references: 'comments(id)',
      notNull: true,
      onDelete: 'CASCADE',
    },
  });
};

exports.down = (pgm) => {
  pgm.createTable('replies');
};
