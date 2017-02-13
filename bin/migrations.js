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
  const command = process.argv[2] || ''
    , toMigration = process.argv[3] || undefined;

  if (command != 'migrate' && command != 'rollback') {
    console.log(`Invalid command '${command}'. Please use 'migrate' or 'rollback'.`);
    process.exit(1);
  }

  const app = require('../../src/app');
  const migrations = app.get('migrations');
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
