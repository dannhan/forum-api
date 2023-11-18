SELECT
  t.id AS id,
  t.title AS title,
  t.body AS body,
  t.date_created AS date,
  u_thread.username AS username,
  JSONB_AGG(
    JSONB_BUILD_OBJECT(
      'id', c.id,
      'content', CASE WHEN c.is_delete THEN '**komentar telah dihapus**' ELSE c.content END,
      'username', u_comment.username,
      'date', c.date_created,
      'replies', (
        SELECT COALESCE(
          JSONB_AGG(
            JSONB_BUILD_OBJECT(
              'id', r.id,
              'content', CASE WHEN r.is_delete THEN '**balasan telah dihapus**' ELSE r.content END,
              'username', u_reply.username,
              'date', r.date_created
            ) ORDER BY r.date_created ASC
          ),
          '[]'::jsonb
        )
        FROM replies r
        LEFT JOIN users u_reply ON r.owner_id = u_reply.id
        WHERE r.comment_id = c.id AND r.is_delete = FALSE
      )
    ) ORDER BY c.date_created ASC
  ) AS comments
FROM
  threads t
JOIN
  users u_thread ON t.owner_id = u_thread.id
LEFT JOIN
  comments c ON t.id = c.thread_id
LEFT JOIN
  users u_comment ON c.owner_id = u_comment.id
WHERE
  t.id = $1
GROUP BY
  t.id, t.title, t.body, t.date_created, u_thread.username