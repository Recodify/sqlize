"use strict";
const _ = require("lodash");
const AbstractDialect = require("../abstract");
const ConnectionManager = require("./connection-manager");
const Query = require("./query");
const QueryGenerator = require("./query-generator");
const DataTypes = require("../../data-types").mysql;
const { MySQLQueryInterface } = require("./query-interface");
class ClickhouseDialect extends AbstractDialect {
  constructor(sequelize) {
    super();
    this.sequelize = sequelize;
    this.connectionManager = new ConnectionManager(this, sequelize);
    this.queryGenerator = new QueryGenerator({
      _dialect: this,
      sequelize
    });
    this.queryInterface = new MySQLQueryInterface(sequelize, this.queryGenerator);
  }
  canBackslashEscape() {
    return true;
  }
}
ClickhouseDialect.prototype.supports = _.merge(_.cloneDeep(AbstractDialect.prototype.supports), {
  "VALUES ()": true,
  "LIMIT ON UPDATE": true,
  lock: true,
  forShare: "LOCK IN SHARE MODE",
  settingIsolationLevelDuringTransaction: false,
  inserts: {
    ignoreDuplicates: " IGNORE",
    updateOnDuplicate: " ON DUPLICATE KEY UPDATE"
  },
  index: {
    collate: false,
    length: true,
    parser: true,
    type: true,
    using: 1
  },
  constraints: {
    dropConstraint: false,
    check: false
  },
  indexViaAlter: true,
  indexHints: true,
  NUMERIC: true,
  GEOMETRY: true,
  JSON: true,
  REGEXP: true
});
ClickhouseDialect.prototype.defaultVersion = "5.7.0";
ClickhouseDialect.prototype.Query = Query;
ClickhouseDialect.prototype.QueryGenerator = QueryGenerator;
ClickhouseDialect.prototype.DataTypes = DataTypes;
ClickhouseDialect.prototype.name = "clickhouse";
ClickhouseDialect.prototype.TICK_CHAR = "`";
ClickhouseDialect.prototype.TICK_CHAR_LEFT = ClickhouseDialect.prototype.TICK_CHAR;
ClickhouseDialect.prototype.TICK_CHAR_RIGHT = ClickhouseDialect.prototype.TICK_CHAR;
module.exports = ClickhouseDialect;
//# sourceMappingURL=index.js.map
