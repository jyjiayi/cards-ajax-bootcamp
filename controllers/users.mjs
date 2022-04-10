import jsSHA from 'jssha';

export default function initUsersController(db) {
  const findUser = async (req, res) => {
    try {
      const user = await db.User.findOne({
        where: {
          email: req.body.email,
        },
      });
      // console.log('user :>> ', user);

      const userPassword = req.body.password;
      const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
      shaObj.update(userPassword);
      const hashedPassword = shaObj.getHash('HEX');

      // console.log('userPassword in table :>> ', user.password);
      // console.log('hashedPassword entered:>> ', hashedPassword);

      if (hashedPassword === user.password) {
        res.cookie('loggedIn', true);
        res.cookie('userId', user.id);
        res.send({ user });
      } else {
        res.send('Login failed!');
      }
    }
    catch (error) {
      console.log(error);
    }
  };

  const insertUser = async (req, res) => {
    try {
      // console.log('req.body.password :>> ', req.body.password);
      // console.log('req.body.email :>> ', req.body.email);
      const userPassword = req.body.password;
      const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
      shaObj.update(userPassword);
      const hashedPassword = shaObj.getHash('HEX');

      const user = await db.User.create({
        email: req.body.email,
        password: hashedPassword,
        created_at: new Date(),
        updated_at: new Date(),
      });
      // console.log('user :>> ', user);
      res.send({ user });
    } catch (error) {
      console.log(error);
    }
  };

  const dashboard = async (req, res) => {
    try {
      const user = await db.User.findOne({
        where: {
          id: req.cookies.userId,
        },
      });
      // console.log('user :>> ', user);
      res.send({ user });
    } catch (error) {
      console.log(error);
    }
  };

  const assignPlayer2 = async (req, res) => {
    try {
      const loggedInUserId = Number(req.cookies.userId);
      // get the total number of players from the table currently
      const allUsers = await db.User.findAll();
      let randNum;
      do {
        randNum = Math.ceil(Math.random() * allUsers.length);
      } while (randNum === loggedInUserId);

      const player2 = await db.User.findOne({
        where: {
          id: randNum,
        },
      });
      // console.log('player2 :>> ', player2);
      res.send({ player2 });
    } catch (error) {
      console.log(error);
    }
  };
  return {
    findUser, insertUser, dashboard, assignPlayer2,
  };
}
