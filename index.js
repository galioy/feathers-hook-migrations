/**
 * Created by gako on 15/01/17.
 */

const Umzug = require('umzug')
  , app = require('../app')
  , errors = require('feathers-errors')
  , Sequelize = app.get('Sequelize')
  , sequelize = app.get('sequelize')
  , log = app.get('log').child({module: 'migration-service'});

/**
 * Instantiate and initialize Umzug (a migration tool) from already loaded DB connection settings in Sails config and
 * additional options.
 *
 * @returns {object}  Umzug The umzug instance that will run the migrations operations
 */
function initUmzug() {
  const sequelizeInstance = new Sequelize(app.get('postgres_migration'));

  return new Umzug({
    storage: 'sequelize',
    logging: log.info,
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
      path: '/app/migrations'
    }
  });
}

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
function executeMigrations(options) {
  const umzug = initUmzug();

  const toMigration = options.toMigration ? {to: options.toMigration} : undefined
    , command = options.command;

  let action;
  if (options.command == 'migrate') {
    action = umzug.up();
  } else if (options.command == 'rollback') {
    action = umzug.down(toMigration);
  } else {
    return Promise.reject(new errors.GeneralError(`The command "${options.command}" is not a valid migrations action.`));
  }

  return action
      .then(migrations => {
      const resultText = migrations.length > 0 ? `The migrations have been ${command}d successfully!`
        : 'No migrations needed to be executed!';
  log.info({subModule: 'execute-migrations'}, resultText);
})
.catch(err => {
    log.error({subModule: 'execute-migrations', err}, `One or more migrations could not be ${command}d. ` +
    'Check table SequelizeMeta to see a list of migrations that have been executed so far.');
  return Promise.reject(err);
});
}

module.exports = {
  executeMigrations: executeMigrations
};
