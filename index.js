/**
 * Created by gako on 15/01/17.
 */

const Umzug = require('umzug')
  , Sequelize = require('sequelize');

const Migrations = function (settings) {
  this.framework = settings.framework;
  this.sequelize = settings.sequelize;
  this.log = settings.log ? settings.log : console.log;
  this.storage = settings.storageType ? settings.storageType : 'sequelize';
  this.path = settings.migrationsPath ? settings.migrationsPath : '/app/migrations';
};

/**
 * Instantiate and initialize Umzug (a migration tool) from already loaded DB connection settings in Sails config and
 * additional options.
 *
 * @returns {object}  Umzug The umzug instance that will run the migrations operations
 */
Migrations.prototype.init = function () {
  let sequelizeInstance = this.sequelize;
  if (!sequelizeInstance.getQueryInterface() && !sequelizeInstance.constructor) {
    sequelizeInstance = new Sequelize(this.sequelize);
  }

  this.umzug = new Umzug({
    storage: this.storage,
    logging: this.log,
    storageOptions: {
      sequelize: sequelizeInstance
    },
    migrations: {
      /*
       * The params that get passed to the migrations `up` and `down` functions:
       * (queryInterface, Sequelize)
       */
      params: [sequelizeInstance.getQueryInterface(), sequelizeInstance.constructor],
      /*
       * The path to the migrations dir
       */
      path: this.path
    }
  });

  const app = requre('../../src/app');
  app.set('migrations', this);
};

/**
 * Perform the execution of the migrations.
 *
 * TO BE EXTENDED WITH:
 * @param {object}  options Contains the following properties:
 *                          {
 *                            command: {string}, - The command designating what to do - 'migrate' or 'rollback'
 *                            toMigration: {string} - (optional) Name of the migration to which to rollback to
 *                          }
 */
Migrations.prototype.execute = function (options) {
  const toMigration = options.toMigration ? {to: options.toMigration} : undefined
    , command = options.command;

  let action;
  if (options.command == 'migrate') {
    action = this.umzug.up();
  } else if (options.command == 'rollback') {
    action = this.umzug.down(toMigration);
  } else {
    return Promise.reject(new Error(`The command "${options.command}" is not a valid migrations action.`));
  }

  return action
    .then(migrations => {
      const resultText = migrations.length > 0 ? `The migrations have been ${command}d successfully!`
        : 'No migrations needed to be executed!';
      this.log(resultText);
    })
    .catch(err => {
      return Promise.reject(err);
    });
};

module.exports = Migrations;
