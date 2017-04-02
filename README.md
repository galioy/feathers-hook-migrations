# Feathers Hook Migrations

## About
A module for automatic execution of migrations upon server lift.

#### Constructor
```javascript
{
  app: {obj},       // The feathers' global app object.
  sequelize: {obj}, // The already initialized Sequelize instance.
  log: {obj},       // A logger object to handle the logging. If not provided, `console.log` is used instead.
  storage: {obj},   // The type of storage to be used - see Umzug's docs. Default is 'sequelize'.
  tableName: {obj}, // The name of the table where the migrations will be tracked, in case 'sequelize' is used as storage.
  path: {obj}       // The physical path (dir) where the migrations files are stored. Must be typed relative to the root dir
}
```

##### Example instantiation and initialization
```javascript
  const Migrations = require('feathers-hook-migrations');

  /* 
   * Initialize the migrations auto-exec hook
   */
  const migrations = new Migrations({
    app,
    sequelize: new Sequelize(app.get('postgres_migration'), {
      dialect: 'postgres',
      logging: false
    }),
    log: app.get('log'),
    tableName: app.get('migration_table') // Default is 'SequelizeMeta'
  });
  migrations.init();
```

***Note:*** The `init()` method will set the Migrations object as a property in the global `app` object,
so it can be accessed as follows: `app.get('migrations')`.

##### Example usage (anywhere):
```javascript
app.get('migrations').execute({command: 'migrate'})
      .then(() => {});
```

##### Example usage at server lift:
In the `src/index.js` file:
```javascript
server.on('listening', () => {
  return app.get('migrations').execute({command: 'migrate'})
      .then(() => {
        console.log('Feather was started on 3030...');
      });
  }
);
```

##### Example usage when the server is running:
1. SSH/login to the server root dir (where the `node_modules` folder is located)
2. Execute one of the commands:
  * `node_modules/.bin/migrations migrate` - to migrate migrations
  * `node_modules/.bin/migrations rollback` - to rollback migrations
  * `node_modules/.bin/migrations rollback 20170202084932-TestMigration` - to rollback all migrations from the last one to the given one
  
*Suggestion:* set these commands as `npm scripts`, f.e.:
```json
"scripts": {
  "migrate": "node_modules/.bin/migrations migrate",
  "rollback": "node_modules/.bin/migrations rollback"
}
```
