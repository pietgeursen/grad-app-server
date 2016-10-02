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
    }),
    knex.schema.table('grads', function(table) {
      table.bigInteger('user_id').index().references('id').inTable('users').onDelete('SET NULL')
    }) 
  ])
}

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.table('grads', function(table) {
      table.dropForeign('user_id')  
    }),
    knex.schema.dropTableIfExists('users')
  ])
}
