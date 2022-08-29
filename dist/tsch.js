"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.array = exports.object = exports.boolean = exports.number = exports.string = void 0;
const TschType_1 = require("./TschType");
function string() { return new TschType_1.TschString(); }
exports.string = string;
function number() { return new TschType_1.TschNumber(); }
exports.number = number;
function boolean() { return new TschType_1.TschBoolean(); }
exports.boolean = boolean;
function object(shape) {
    return new TschType_1.TschObject(shape);
}
exports.object = object;
function array(elementType) {
    return new TschType_1.TschArray(elementType);
}
exports.array = array;
