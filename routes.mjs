import db from './models/index.mjs';

import initGamesController from './controllers/games.mjs';
import initUsersController from './controllers/users.mjs';

export default function bindRoutes(app) {
  const GamesController = initGamesController(db);
  const UserController = initUsersController(db);

  // main page
  app.get('/', GamesController.index);
  // create a new game
  app.post('/games', GamesController.create);
  // update a game with new cards
  app.put('/games/:id/deal', GamesController.deal);
  // create a new user
  app.post('/createUser', UserController.insertUser);
  // login for existing user
  app.post('/login', UserController.findUser);
  // to retrieve the particular user
  app.get('/user', UserController.dashboard);
  // to randomly assign a player 2
  app.get('/assignPlayer2', UserController.assignPlayer2);
  // to display only the latest game to user
  app.post('/refresh', GamesController.findGame);
}
