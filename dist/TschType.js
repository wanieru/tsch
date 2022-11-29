"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TschArray = exports.TschObject = exports.TschUnion = exports.TschUndefined = exports.TschNull = exports.TschBoolean = exports.TschNumber = exports.TschString = exports.TschType = void 0;
class TschValidationError {
    constructor(path, message) {
        this.path = path;
        this.pathString = this.formatPath(path);
        this.rawMessage = message;
        this.message = `${this.pathString}: ${message}`;
    }
    formatPath(path) {
        if (path.length < 1)
            return "root";
        return path.join(".");
    }
}
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
        return new TschUnion(this, new TschUndefined());
    }
    nullable() {
        return new TschUnion(this, new TschNull());
    }
    clone() {
        const clone = this.newInstance();
        clone._title = this._title;
        clone._description = this._description;
        clone._default = this._default;
        return clone;
    }
    title(title) {
        const clone = this.clone();
        clone._title = title;
        return clone;
    }
    description(descriptin) {
        const clone = this.clone();
        clone._description = descriptin;
        return clone;
    }
    default(defaultValue) {
        const clone = this.clone();
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
    validate(input) {
        const errors = [];
        this.validateInternal([], input, errors);
        return { valid: errors.length == 0, errors };
    }
    validateInternal(path, input, errors) {
        if (!this.isCorrectType(input)) {
            errors.push(new TschValidationError(path, `Value has to be of type ${this.getTypeName()}`));
            return;
        }
        this.validateCorrectType(path, input, errors);
    }
    isOptional() { return false; }
    isNullable() { return false; }
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
    newInstance() {
        return new TschString();
    }
    clone() {
        const clone = super.clone();
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
        const clone = this.clone();
        clone._minLength = min;
        return clone;
    }
    maxLength(max) {
        const clone = this.clone();
        clone._maxLength = max;
        return clone;
    }
    enumeration(enumeration) {
        const clone = this.clone();
        clone._enum = [...enumeration];
        return clone;
    }
    format(format) {
        const clone = this.clone();
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
    isCorrectType(input) {
        return typeof input === "string";
    }
    getTypeName() { return "string"; }
    validateCorrectType(path, input, errors) {
        if (!!this._enum && !this._enum.includes(input)) {
            errors.push(new TschValidationError(path, `Value has to be one of the following: ${this._enum.join(", ")}`));
        }
        if (typeof this._minLength === "number" && input.length < this._minLength) {
            errors.push(new TschValidationError(path, `Value must be longer than ${this._minLength} characters.`));
        }
        if (typeof this._maxLength === "number" && input.length > this._maxLength) {
            errors.push(new TschValidationError(path, `Value must be shorter than ${this._maxLength} characters.`));
        }
        if (this._format === "color" && !/^#?[0-9a-f]{3,6}$/i.test(input)) {
            errors.push(new TschValidationError(path, `Value must be a color hex code.`));
        }
        if (this._format === "date" && Number.isNaN(Date.parse(input))) {
            errors.push(new TschValidationError(path, `Value must be a date.`));
        }
        if (this._format === "email" && !/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(input)) {
            errors.push(new TschValidationError(path, `Value must be an email.`));
        }
        if (this._format === "url" && !/^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/.test(input)) {
            errors.push(new TschValidationError(path, `Value must be an email.`));
        }
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
    newInstance() {
        return new TschNumber();
    }
    clone() {
        const clone = super.clone();
        clone._integer = this._integer;
        clone._min = this._min;
        clone._max = this._max;
        return clone;
    }
    integer() {
        const clone = this.clone();
        clone._integer = true;
        return clone;
    }
    min(min) {
        const clone = this.clone();
        clone._min = min;
        return clone;
    }
    max(max) {
        const clone = this.clone();
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
    isCorrectType(input) {
        return typeof input === "number";
    }
    getTypeName() { return "number"; }
    validateCorrectType(path, input, errors) {
        if (this._integer && !Number.isInteger(input)) {
            errors.push(new TschValidationError(path, `Value has to be an integer.`));
        }
        if (typeof this._min === "number" && input < this._min) {
            errors.push(new TschValidationError(path, `Value must be at least ${this._min}.`));
        }
        if (typeof this._max === "number" && input > this._max) {
            errors.push(new TschValidationError(path, `Value must be at less than ${this._max}.`));
        }
    }
}
exports.TschNumber = TschNumber;
class TschBoolean extends TschType {
    constructor() {
        super("boolean");
    }
    newInstance() {
        return new TschBoolean();
    }
    clone() {
        const clone = super.clone();
        return clone;
    }
    isCorrectType(input) {
        return typeof input === "boolean";
    }
    getTypeName() { return "boolean"; }
    validateCorrectType(path, input, errors) {
    }
}
exports.TschBoolean = TschBoolean;
class TschNull extends TschType {
    constructor() {
        super("null");
    }
    newInstance() {
        return new TschNull();
    }
    clone() {
        const clone = super.clone();
        return clone;
    }
    isCorrectType(input) {
        return typeof input === null;
    }
    getTypeName() { return "null"; }
    validateCorrectType(path, input, errors) {
    }
}
exports.TschNull = TschNull;
class TschUndefined extends TschType {
    constructor() {
        super("undefined");
    }
    newInstance() {
        return new TschUndefined();
    }
    clone() {
        const clone = super.clone();
        return clone;
    }
    isCorrectType(input) {
        return typeof input === "undefined";
    }
    getTypeName() { return "undefined"; }
    validateCorrectType(path, input, errors) {
    }
}
exports.TschUndefined = TschUndefined;
class TschUnion extends TschType {
    constructor(type1, type2) {
        super(`union_${type1._type}_${type2._type}`);
        this.type1 = type1;
        this.type2 = type2;
    }
    Type1Internal() { return this.type1; }
    Type2Internal() { return this.type2; }
    newInstance() {
        return new TschUnion(this.type1.clone(), this.type2.clone());
    }
    clone() {
        const clone = super.clone();
        clone.type1 = this.Type1Internal().clone();
        clone.type2 = this.Type2Internal().clone();
        return clone;
    }
    getJsonSchemaProperty() {
        var _a, _b, _c, _d;
        const schema1 = this.Type1Internal()._type === "undefined" ? {} : this.type1.getJsonSchemaProperty();
        const schema2 = this.Type2Internal()._type === "undefined" ? {} : this.type2.getJsonSchemaProperty();
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
    isNullable() {
        return this.Type1Internal()._type === "null" || this.Type2Internal()._type === "null" || this.Type1Internal().isNullable() || this.Type2Internal().isNullable();
    }
    isOptional() {
        return this.Type1Internal()._type === "undefined" || this.Type2Internal()._type === "undefined" || this.Type1Internal().isOptional() || this.Type2Internal().isOptional();
    }
    isCorrectType(input) {
        return this.Type1Internal().isCorrectType(input) || this.Type2Internal().isCorrectType(input);
    }
    getTypeName() { return `${this.type1.getTypeName()} or ${this.type2.getTypeName()}`; }
    validateCorrectType(path, input, errors) {
        if (this.Type1Internal().isCorrectType(input)) {
            this.Type1Internal().validateInternal(path, input, errors);
        }
        if (this.Type2Internal().isCorrectType(input)) {
            this.Type2Internal().validateInternal(path, input, errors);
        }
    }
}
exports.TschUnion = TschUnion;
class TschObject extends TschType {
    constructor(shape) {
        super("object");
        this.shape = shape;
    }
    newInstance() {
        return new TschObject(this.shape);
    }
    clone() {
        const clone = super.clone();
        clone.shape = this.shape;
        return clone;
    }
    getJsonSchemaProperty() {
        const schema = super.getJsonSchemaProperty();
        schema.required = Object.keys(this.shape).filter(k => !this.shape[k].isOptional());
        schema.properties = {};
        for (const key in this.shape) {
            schema.properties[key] = this.shape[key].getJsonSchemaProperty();
        }
        return schema;
    }
    isCorrectType(input) {
        return typeof input === "object" && input !== null && !Array.isArray(input);
    }
    getTypeName() {
        return "object";
    }
    validateCorrectType(path, input, errors) {
        for (const key in this.shape) {
            const child = this.shape[key];
            const childInternal = child;
            if (!childInternal.isOptional() && !input.hasOwnProperty(key)) {
                errors.push(new TschValidationError(path, `Property ${key} of type ${childInternal.getTypeName()} is required.`));
            }
            if (input.hasOwnProperty(key)) {
                childInternal.validateInternal([...path, key], input[key], errors);
            }
        }
    }
}
exports.TschObject = TschObject;
class TschArray extends TschType {
    constructor(elementType) {
        super("array");
        this.elementType = elementType;
        this._format = null;
        this._minElementCount = null;
        this._maxElementCount = null;
        this._unique = false;
    }
    newInstance() {
        return new TschArray(this.elementType);
    }
    clone() {
        const clone = super.clone();
        clone.elementType = this.elementType;
        clone._format = this._format;
        clone._unique = this._unique;
        clone._minElementCount = this._minElementCount;
        clone._maxElementCount = this._maxElementCount;
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
        const clone = this.clone();
        clone._format = "table";
        return clone;
    }
    minElements(count) {
        const clone = this.clone();
        clone._minElementCount = count;
        return clone;
    }
    maxElements(count) {
        const clone = this.clone();
        clone._maxElementCount = count;
        return clone;
    }
    unique() {
        const clone = this.clone();
        clone._unique = true;
        return clone;
    }
    isCorrectType(input) {
        return typeof input === "object" && input !== null && Array.isArray(input);
    }
    getTypeName() {
        return `array of ${this.elementType.getTypeName()}`;
    }
    validateCorrectType(path, input, errors) {
        const elementTypeInternal = this.elementType;
        const used = new Set();
        if (typeof this._minElementCount === "number" && input.length < this._minElementCount) {
            errors.push(new TschValidationError(path, `Array must contain at least ${this._minElementCount} elements.`));
        }
        if (typeof this._maxElementCount === "number" && input.length > this._maxElementCount) {
            errors.push(new TschValidationError(path, `Array must contain at most ${this._maxElementCount} elements.`));
        }
        for (let i = 0; i < input.length; i++) {
            const element = input[i];
            elementTypeInternal.validateInternal([...path, i.toString()], element, errors);
            if (this._unique) {
                const json = JSON.stringify(element);
                if (used.has(json)) {
                    errors.push(new TschValidationError(path, "All values have to be unique."));
                }
                used.add(json);
            }
        }
    }
}
exports.TschArray = TschArray;
//# sourceMappingURL=TschType.js.map