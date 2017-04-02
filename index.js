/**
 * Created by gako on 15/01/17.
 */

const Umzug = require('umzug')
  , Sequelize = require('sequelize');

/**
 * Constructor
 *
 * @param {object} settings
 * {
 *  app: {obj},       // The feathers' global app object.
 *  sequelize: {obj}, // The already initialized Sequelize instance.
 *  log: {obj},       // A logger object to handle the logging. If not provided, `console.log` is used instead.
 *  storage: {obj},   // The type of storage to be used - see Umzug's docs. Default is 'sequelize'.
 *  tableName: {obj}, // The name of the table where the migrations will be tracked, in case 'sequelize' is used as storage.
 *  path: {obj}       // The physical path (dir) where the migrations files are stored. Must be typed relative to the root dir
 * }
 * @constructor
 */
const Migrations = function (settings) {
  this.app = settings.app;
  this.sequelize = settings.sequelize;
  this.log = settings.log ? settings.log : console.log;
  this.storage = settings.storageType ? settings.storageType : 'sequelize';
  this.tableName = settings.tableName ? settings.tableName : 'SequelizeMeta';
  this.path = settings.migrationsPath ? settings.migrationsPath : '/app/migrations';
};

/**
 * Instantiate and initialize Umzug (a migration tool) from already loaded DB connection settings in the server app, and
 * additional options.
 *
 * Set the initialized Umzug object as a property of this module and then set the module as property of the
 * global server app object.
 */
Migrations.prototype.init = function () {
  let sequelizeInstance = this.sequelize;
  if (!sequelizeInstance.getQueryInterface() && !sequelizeInstance.constructor) {
    sequelizeInstance = new Sequelize(this.sequelize);
  }

  this.umzug = new Umzug({
    storage: this.storage,
    logging: this.log.info.bind(this.log),
    storageOptions: {
      sequelize: sequelizeInstance,
      tableName: this.tableName
    },
    migrations: {
      /*
       * The params that get passed to the migrations `up` and `down` functions:
       * (queryInterface, Sequelize)
       */
      params: [sequelizeInstance.getQueryInterface(), sequelizeInstance.constructor],
      /*
       * The path to the migrations dir, relative to the root dir
       */
      path: this.path
    }
  });

  this.app.set('migrations', this);
};

/**
 * Perform the execution of the migrations.
 *
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
  if (options.command === 'migrate') {
    action = this.umzug.up();
  } else if (options.command === 'rollback') {
    action = this.umzug.down(toMigration);
  } else {
    return Promise.reject(new Error(`The command "${options.command}" is not a valid migrations action.`));
  }

  return action
    .then((migrations) => {
      const resultText = migrations.length > 0 ? `The migrations have been ${command}d successfully!`
        : 'No migrations needed to be executed!';
      this.log.info(resultText);
    })
    .catch((err) => {
      this.log.error({err}, `An error occurred while trying to ${command} the migrations.`);
      return Promise.reject(err);
    });
};

module.exports = Migrations;
