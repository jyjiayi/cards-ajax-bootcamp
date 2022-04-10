const jsSHA = require('jssha');

module.exports = {
  up: async (queryInterface) => {
    const userPassword1 = 'player1';
    const shaObj1 = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
    shaObj1.update(userPassword1);
    const hashedPassword1 = shaObj1.getHash('HEX');

    const userPassword2 = 'player2';
    const shaObj2 = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
    shaObj2.update(userPassword2);
    const hashedPassword2 = shaObj2.getHash('HEX');
    const userList = [{
      email: 'player1@gmail.com',
      password: hashedPassword1,
      created_at: new Date(),
      updated_at: new Date(),
    }, {
      email: 'player2@gmail.com',
      password: hashedPassword2,
      created_at: new Date(),
      updated_at: new Date(),
    }];

    await queryInterface.bulkInsert('users', userList);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('users', null, {});
  },
};
