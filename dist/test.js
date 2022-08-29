"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const person = _1.tsch.object({
    name: _1.tsch.string().description("First and Last Name").minLength(4).default("Jeremy Dorn"),
    age: _1.tsch.number().integer().default(25).min(18).max(99).optional(),
    favorite_color: _1.tsch.string().color().title("favorite color").default("#ffa500"),
    gender: _1.tsch.string().enumeration(["male", "female", "other"]),
    date: _1.tsch.string().date(),
    location: _1.tsch.object({
        city: _1.tsch.string().default("San Francisco"),
        state: _1.tsch.string().default("CA")
    }).title("Location"),
    pets: _1.tsch.array(_1.tsch.object({
        type: _1.tsch.string().enumeration(["cat", "dog", "bird", "reptile", "other"]).default("dog"),
        name: _1.tsch.string()
    }).title("Pet")).unique().table().default([{ type: "dog", name: "Walter" }])
}).title("Person");
const personJsonSchema = person.getJsonSchemaProperty();
console.log(JSON.stringify(personJsonSchema, null, 2));
