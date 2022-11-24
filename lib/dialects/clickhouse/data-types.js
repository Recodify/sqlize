"use strict";
const wkx = require("wkx");
const _ = require("lodash");
const momentTz = require("moment-timezone");
const moment = require("moment");
module.exports = (BaseTypes) => {
  BaseTypes.ABSTRACT.prototype.dialectTypes = "https://dev.clickhouse.com/doc/refman/5.7/en/data-types.html";
  BaseTypes.DATE.types.clickhouse = ["DATETIME"];
  BaseTypes.STRING.types.clickhouse = ["VAR_STRING"];
  BaseTypes.CHAR.types.clickhouse = ["STRING"];
  BaseTypes.TEXT.types.clickhouse = ["BLOB"];
  BaseTypes.TINYINT.types.clickhouse = ["TINY"];
  BaseTypes.SMALLINT.types.clickhouse = ["SHORT"];
  BaseTypes.MEDIUMINT.types.clickhouse = ["INT24"];
  BaseTypes.INTEGER.types.clickhouse = ["LONG"];
  BaseTypes.BIGINT.types.clickhouse = ["LONGLONG"];
  BaseTypes.FLOAT.types.clickhouse = ["FLOAT"];
  BaseTypes.TIME.types.clickhouse = ["TIME"];
  BaseTypes.DATEONLY.types.clickhouse = ["DATE"];
  BaseTypes.BOOLEAN.types.clickhouse = ["TINY"];
  BaseTypes.BLOB.types.clickhouse = ["TINYBLOB", "BLOB", "LONGBLOB"];
  BaseTypes.DECIMAL.types.clickhouse = ["NEWDECIMAL"];
  BaseTypes.UUID.types.clickhouse = false;
  BaseTypes.ENUM.types.clickhouse = false;
  BaseTypes.REAL.types.clickhouse = ["DOUBLE"];
  BaseTypes.DOUBLE.types.clickhouse = ["DOUBLE"];
  BaseTypes.GEOMETRY.types.clickhouse = ["GEOMETRY"];
  BaseTypes.JSON.types.clickhouse = ["JSON"];
  class DECIMAL extends BaseTypes.DECIMAL {
    toSql() {
      let definition = super.toSql();
      if (this._unsigned) {
        definition += " UNSIGNED";
      }
      if (this._zerofill) {
        definition += " ZEROFILL";
      }
      return definition;
    }
  }
  class DATE extends BaseTypes.DATE {
    toSql() {
      return this._length ? `DATETIME(${this._length})` : "DATETIME";
    }
    _stringify(date, options) {
      if (!moment.isMoment(date)) {
        date = this._applyTimezone(date, options);
      }
      if (this._length) {
        return date.format("YYYY-MM-DD HH:mm:ss.SSS");
      }
      return date.format("YYYY-MM-DD HH:mm:ss");
    }
    static parse(value, options) {
      value = value.string();
      if (value === null) {
        return value;
      }
      if (momentTz.tz.zone(options.timezone)) {
        value = momentTz.tz(value, options.timezone).toDate();
      } else {
        value = new Date(`${value} ${options.timezone}`);
      }
      return value;
    }
  }
  class DATEONLY extends BaseTypes.DATEONLY {
    static parse(value) {
      return value.string();
    }
  }
  class UUID extends BaseTypes.UUID {
    toSql() {
      return "CHAR(36) BINARY";
    }
  }
  const SUPPORTED_GEOMETRY_TYPES = ["POINT", "LINESTRING", "POLYGON"];
  class GEOMETRY extends BaseTypes.GEOMETRY {
    constructor(type, srid) {
      super(type, srid);
      if (_.isEmpty(this.type)) {
        this.sqlType = this.key;
        return;
      }
      if (SUPPORTED_GEOMETRY_TYPES.includes(this.type)) {
        this.sqlType = this.type;
        return;
      }
      throw new Error(`Supported geometry types are: ${SUPPORTED_GEOMETRY_TYPES.join(", ")}`);
    }
    static parse(value) {
      value = value.buffer();
      if (!value || value.length === 0) {
        return null;
      }
      value = value.slice(4);
      return wkx.Geometry.parse(value).toGeoJSON({ shortCrs: true });
    }
    toSql() {
      return this.sqlType;
    }
  }
  class ENUM extends BaseTypes.ENUM {
    toSql(options) {
      return `ENUM(${this.values.map((value) => options.escape(value)).join(", ")})`;
    }
  }
  class JSONTYPE extends BaseTypes.JSON {
    _stringify(value, options) {
      return options.operation === "where" && typeof value === "string" ? value : JSON.stringify(value);
    }
  }
  return {
    ENUM,
    DATE,
    DATEONLY,
    UUID,
    GEOMETRY,
    DECIMAL,
    JSON: JSONTYPE
  };
};
//# sourceMappingURL=data-types.js.map
