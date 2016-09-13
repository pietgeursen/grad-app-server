exports.up = function (knex, Promise) {
  return knex.schema.createTable('users', function (table) {
    table.increments('id')
    table.timestamps()
    table.string('email').notNullable().unique()
    table.index('email')
    table.string('password')
    table.string('roles')
    table.integer('grad_id')
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTableIfExists('users')
}
