# tsch - TypeScript x JSON Schema

## What it does (currently)

- Define Typescript interfaces/types using a fluent syntax
- Typescript-centric type inference
- Conversion of types to JSON Schema for use with a JSON Editor

## What it doesn't (yet)

- Data validation (Verifying whether or not some given data fits the schema)
- Data parsing (Converting input data to something else according to the schema definition)

## How to use

```ts
import { tsch } from ".";

const person = tsch.object({
    name: tsch.string().description("First and Last Name").minLength(4).default("Jeremy Dorn"),
    age: tsch.number().integer().default(25).min(18).max(99).optional(),
    favorite_color: tsch.string().color().title("favorite color").default("#ffa500"),
    gender: tsch.string().enumeration(["male", "female", "other"]),
    date: tsch.string().date(),
    location: tsch.object({
        city: tsch.string().default("San Francisco"),
        state: tsch.string().default("CA")
    }).title("Location"),
    pets: tsch.array(tsch.object({
        type: tsch.string().enumeration(["cat", "dog", "bird", "reptile", "other"]).default("dog"),
        name: tsch.string()
    }).title("Pet")).unique().table().default([{ type: "dog", name: "Walter" }])
}).title("Person");
type Person = tsch.Infer<typeof person>;
const personJsonSchema = person.getJsonSchemaProperty();
```