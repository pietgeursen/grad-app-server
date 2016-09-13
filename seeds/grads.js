exports.seed = function (knex, Promise) {
  // Deletes ALL existing entries
  return knex('grads').del()
    .then(function () {
      return knex('users').del()
    })
    .then(function () {
      return Promise.all([
        // Inserts seed entries
        knex('grads').insert([
          {
            id: 1,
            user_id: 2,
            name: 'Piet Geursen',
            image_link: 'http://26.media.tumblr.com/tumblr_lh3j390T241qfyzelo1_1280.jpg',
            github_link: 'https://github.com/pietgeursen',
            phone: '+6427424333',
            short_description: 'Learning fiend, teacher, coder',
            long_description: `Kia ora.. Left my scooter outside the dairy, this bloody scarfie is as chronic as a rough as guts bloke. Mean while, in West Auckland, Sir Edmond Hillary and Jim Hickey were up to no good with a bunch of thermo-nuclear marmite shortages. Fully, spit the dummy. The chocka full force of his playing rugby was on par with Bazza's fully sick chilly bin. I was just at home having some dots...., rack off.`

          },
          {
            id: 2,
            user_id: 3,
            name: 'Mix Mix',
            image_link: 'http://25.media.tumblr.com/tumblr_lyxm5waoQQ1r4c11po1_500.jpg',
            github_link: 'https://github.com/mixmix',
            phone: '+64274243',
            short_description: 'Harry potter fan, coffee diluter, abacus',
            long_description: `Put the jug on will you bro, all these sweet as length of number 8 wires can wait till later. Reckon ya got a sheep loose in you're top paddock mate, you don't know his story, bro, just a little bit, ay. The first prize for rooting goes to... Lomu and his beaut kiwi, what a manus. Bro, lamingtons are really outrageously awesome good with stuffed onion dips, aye. You have no idea how solid rimu our heaps good Swanndris were aye. Every time I see those beached as pieces of pounamu it's like Rangitoto Island all over again aye, piece of piss. Anyway, Helen Clarke is just John Key in disguise, to find the true meaning of life, one must start boiling-up with the weka, mate. Speights, pride of the south for over 100 years. After the jersey is flogged, you add all the wicked cookie times to the foreshore and seabed issue you've got yourself a meal. Technology has allowed random brain drains to participate in the global conversation of kiwi as Monopoly money, from the New Zealand version with Queen Street and stuff. The next Generation of bung ankle biters have already skived off over at Pack n' Save.`

          }

        ]),
        knex('users').insert([
          {
            id: 1,
            email: 'admin@edaGrad.com',
            admin: true
          },
          {
            id: 2,
            grad_id: 1,
            email: 'pietgeursen@gmail.com',
            password_hash: 'sercretsss'
          },
          {
            id: 3,
            grad_id: 2,
            email: 'mixmix@gmail.com'
          }
        ])
      ])
    })
}
