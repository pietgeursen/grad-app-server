exports.up = function (knex, Promise) {
  return knex.schema.createTable('grads', function (table) {
    table.increments()
    table.timestamps()
    table.string('name')
    table.string('short_description')
    table.text('long_description')
    table.string('phone')
    table.string('image_link')
    table.string('github_link')
    table.string('cv_link')
    table.integer('user_id')
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTableIfExists('grads')
}
