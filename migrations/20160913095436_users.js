exports.up = function (knex, Promise) {
  return knex.schema.createTable('users', function (table) {
    table.increments()
    table.timestamps()
    table.string('email').notNullable()
    table.index('email')
    table.string('password_hash')
    table.boolean('admin').defaultTo(false)
    table.integer('grad_id')
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTableIfExists('users')
}
