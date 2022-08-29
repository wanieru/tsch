"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TschArray = exports.TschObject = exports.TschUnion = exports.TschBoolean = exports.TschNumber = exports.TschString = exports.TschType = void 0;
class TschType {
    constructor(type) {
        this._ts = null; //_ts is only used by Typescript for type inference, and so actually doesn't need to be assigned
        this._type = type;
        this._title = null;
        this._description = null;
        this._default = null;
    }
    union(other) {
        return new TschUnion(this, other);
    }
    optional() {
        return new TschUnion(this, new TschType("undefined"));
    }
    nullable() {
        return new TschUnion(this, new TschType("null"));
    }
    _baseClone() {
        return new TschType(this._type);
    }
    _clone() {
        const clone = this._baseClone();
        clone._title = this._title;
        clone._description = this._description;
        clone._default = this._default;
        return clone;
    }
    title(title) {
        const clone = this._clone();
        clone._title = title;
        return clone;
    }
    description(descriptin) {
        const clone = this._clone();
        clone._description = descriptin;
        return clone;
    }
    default(defaultValue) {
        const clone = this._clone();
        clone._default = defaultValue;
        return clone;
    }
    getJsonSchemaProperty() {
        const schema = {
            "type": this._type
        };
        if (this._title)
            schema.title = this._title;
        if (this._description)
            schema.description = this._description;
        if (this._default)
            schema.default = this._default;
        return schema;
    }
    _isOptional() { return false; }
    _isNullable() { return false; }
}
exports.TschType = TschType;
class TschString extends TschType {
    constructor() {
        super("string");
        this._format = null;
        this._enum = null;
        this._minLength = null;
        this._maxLength = null;
    }
    _baseClone() {
        return new TschString();
    }
    _clone() {
        const clone = super._clone();
        clone._format = this._format;
        clone._enum = this._enum;
        clone._minLength = this._minLength;
        clone._maxLength = this._maxLength;
        return clone;
    }
    getJsonSchemaProperty() {
        const schema = super.getJsonSchemaProperty();
        if (this._format)
            schema.format = this._format;
        if (this._enum)
            schema.enum = this._enum;
        if (this._minLength)
            schema.minLength = this._minLength;
        if (this._maxLength)
            schema.maxLength = this._maxLength;
        return schema;
    }
    minLength(min) {
        const clone = this._clone();
        clone._minLength = min;
        return clone;
    }
    maxLength(max) {
        const clone = this._clone();
        clone._maxLength = max;
        return clone;
    }
    enumeration(enumeration) {
        const clone = this._clone();
        clone._enum = [...enumeration];
        return clone;
    }
    format(format) {
        const clone = this._clone();
        clone._format = format;
        return clone;
    }
    color() {
        return this.format("color");
    }
    date() {
        return this.format("date");
    }
    email() {
        return this.format("email");
    }
    password() {
        return this.format("password");
    }
    textarea() {
        return this.format("textarea");
    }
    url() {
        return this.format("url");
    }
}
exports.TschString = TschString;
class TschNumber extends TschType {
    constructor() {
        super("number");
        this._integer = false;
        this._min = null;
        this._max = null;
    }
    _baseClone() {
        return new TschNumber();
    }
    _clone() {
        const clone = super._clone();
        clone._integer = this._integer;
        clone._min = this._min;
        clone._max = this._max;
        return clone;
    }
    integer() {
        const clone = this._clone();
        clone._integer = true;
        return clone;
    }
    min(min) {
        const clone = this._clone();
        clone._min = min;
        return clone;
    }
    max(max) {
        const clone = this._clone();
        clone._max = max;
        return clone;
    }
    getJsonSchemaProperty() {
        const schema = super.getJsonSchemaProperty();
        if (this._integer)
            schema.type = "integer";
        if (this._min !== null)
            schema.minimum = this._min;
        if (this._max !== null)
            schema.maximum = this._max;
        return schema;
    }
}
exports.TschNumber = TschNumber;
class TschBoolean extends TschType {
    constructor() {
        super("boolean");
    }
    _baseClone() {
        return new TschBoolean();
    }
    _clone() {
        const clone = super._clone();
        return clone;
    }
}
exports.TschBoolean = TschBoolean;
class TschUnion extends TschType {
    constructor(type1, type2) {
        super(`union_${type1._type}_${type2._type}`);
        this.type1 = type1;
        this.type2 = type2;
    }
    _baseClone() {
        return new TschUnion(this.type1._clone(), this.type2._clone());
    }
    _clone() {
        const clone = super._clone();
        clone.type1 = this.type1._clone();
        clone.type2 = this.type2._clone();
        return clone;
    }
    getJsonSchemaProperty() {
        var _a, _b, _c, _d;
        const schema1 = this.type1._type === "undefined" ? {} : this.type1.getJsonSchemaProperty();
        const schema2 = this.type2._type === "undefined" ? {} : this.type2.getJsonSchemaProperty();
        const combined = Object.assign(Object.assign({}, schema1), schema2);
        combined.type = [...(Array.isArray(schema1.type) ? schema1.type : [schema1.type]), ...(Array.isArray(schema2.type) ? schema2.type : [schema2.type])].filter(t => !!t && t !== "undefined");
        if (combined.type.length < 2)
            combined.type = combined.type[0];
        if (schema1.properties && schema2.properties) {
            combined.properties = Object.assign(Object.assign({}, ((_a = schema1.properties) !== null && _a !== void 0 ? _a : {})), ((_b = schema2.properties) !== null && _b !== void 0 ? _b : {}));
            if (!!schema1.required && !!schema2.required)
                combined.required = schema1.required.filter((f) => { var _a; return (_a = schema2.required) === null || _a === void 0 ? void 0 : _a.includes(f); });
            else
                combined.required = (_d = (_c = schema1.required) !== null && _c !== void 0 ? _c : schema2.required) !== null && _d !== void 0 ? _d : [];
        }
        if (this._title)
            combined.title = this._title;
        if (this._description)
            combined.description = this._description;
        if (this._default)
            combined.default = this._default;
        return combined;
    }
    _isNullable() {
        return this.type1._type === "null" || this.type2._type === "null" || this.type1._isNullable() || this.type2._isNullable();
    }
    _isOptional() {
        return this.type1._type === "undefined" || this.type2._type === "undefined" || this.type1._isOptional() || this.type2._isOptional();
    }
}
exports.TschUnion = TschUnion;
class TschObject extends TschType {
    constructor(shape) {
        super("object");
        this.shape = shape;
    }
    _baseClone() {
        return new TschObject(this.shape);
    }
    _clone() {
        const clone = super._clone();
        clone.shape = this.shape;
        return clone;
    }
    getJsonSchemaProperty() {
        const schema = super.getJsonSchemaProperty();
        schema.required = Object.keys(this.shape).filter(k => !this.shape[k]._isOptional());
        schema.properties = {};
        for (const key in this.shape) {
            schema.properties[key] = this.shape[key].getJsonSchemaProperty();
        }
        return schema;
    }
}
exports.TschObject = TschObject;
class TschArray extends TschType {
    constructor(elementType) {
        super("array");
        this.elementType = elementType;
        this._format = null;
        this._unique = false;
    }
    _baseClone() {
        return new TschArray(this.elementType);
    }
    _clone() {
        const clone = super._clone();
        clone.elementType = this.elementType;
        clone._format = this._format;
        clone._unique = this._unique;
        return clone;
    }
    getJsonSchemaProperty() {
        const schema = super.getJsonSchemaProperty();
        schema.items = this.elementType.getJsonSchemaProperty();
        if (this._format)
            schema.format = this._format;
        if (this._unique)
            schema.uniqueItems = this._unique;
        return schema;
    }
    table() {
        const clone = this._clone();
        clone._format = "table";
        return clone;
    }
    unique() {
        const clone = this._clone();
        clone._unique = true;
        return clone;
    }
}
exports.TschArray = TschArray;
//# sourceMappingURL=TschType.js.map