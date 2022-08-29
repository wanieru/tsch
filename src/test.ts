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

console.log(JSON.stringify(personJsonSchema, null, 2));