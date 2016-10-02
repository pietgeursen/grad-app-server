exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable('users', function (table) {
      table.increments('id').primary()
      table.timestamps()
      table.string('email').notNullable().unique()
      table.index('email')
      table.string('password')
      table.string('roles')
      table.integer('grad_id')
    })
  ])
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTableIfExists('users')
}
