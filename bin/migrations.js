#!/usr/bin/env node
/**
 * Created by gako on 19/01/17.
 */
"use strict";

/**
 * This script can be called manually from the terminal, with parameters (in the order as written):
 * node migrations.js command name_of_migration
 *
 * Eg.:
 * migrate
 *
 * or:
 * rollback
 *
 * or:
 * rollback 20160720091011-TestMigration
 *
 * In case the `rollback` command is used with a name of migration as parameter - this is the name of the migration
 * UNTIL which you would wish to rollback to (including the specified one).
 * So, all migration executed before that migration will be rollbacked as well.
 */

/**
 * Main function of this script - executes the script.
 *
 * Gathers the parameters from the command typed in the terminal and then the calls function to execute migrations.
 *
 * @returns {boolean}
 */
function run() {
  const framework = process.argv[2]
    , command = process.argv[3] || ''
    , toMigration = process.argv[4] || undefined;

  let migrations;

  if (framework == 'feathers') {
    const app = requre('../../src/app');
    migrations = app.get('migrations');
  } else if (framework == 'sails') {
    migrations = sails.migrations;
  } else {
    console.log(`Framework with name ${framework} is not recognized. Available options are 'feathers' or 'sails'.`);
    process.exit(1);
  }

  if (command != 'migrate' && command != 'rollback') {
    console.log(`Invalid command '${command}'. Please use 'migrate' or 'rollback'.`);
    process.exit(1);
  }

  return migrations.execute({command, toMigration})
    .then(() => {
      process.exit(0);
    })
    .catch(() => {
      process.exit(1);
    });
}

/**
 * Calling point of the main function of the script.
 */
run();
