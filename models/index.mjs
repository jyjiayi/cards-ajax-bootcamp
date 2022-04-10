import { Sequelize } from 'sequelize';
import allConfig from '../config/config.js';

import gameModel from './game.mjs';
import userModel from './user.mjs';
import gameuserModel from './gameuser.mjs';

const env = process.env.NODE_ENV || 'development';

const config = allConfig[env];

const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

// add your model definitions to db here
db.Game = gameModel(sequelize, Sequelize.DataTypes);
db.User = userModel(sequelize, Sequelize.DataTypes);
db.GameUser = gameuserModel(sequelize, Sequelize.DataTypes);

db.User.belongsToMany(db.Game, { through: 'gamesusers' });
db.Game.belongsToMany(db.User, { through: 'gamesusers' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
