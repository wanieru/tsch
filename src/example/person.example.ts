import { tsch } from "..";

const person = tsch.object().title("Person").shape({
    name: tsch.string().description("First and Last Name").minLength(4).default("Jeremy Dorn"),
    age: tsch.number().integer().default(25).min(18).max(99).optional().title("Age"),
    favorite_color: tsch.string().color().title("favorite color").default("#ffa500").examples(["#fff", "#00ff00"]),
    gender: tsch.string().enumeration(["male", "female", "other"]).nullable(),
    date: tsch.string().date().enumeration(["2022/12/22", "2021/11/11"]).union(tsch.number().min(50)).union(tsch.number().min(25)),
    location: tsch.object({
        city: tsch.string().default("San Francisco"),
        state: tsch.string().default("CA")
    }).title("Location"),
    pets: tsch.array(tsch.object({
        type: tsch.string().enumeration(["cat", "dog", "bird", "reptile", "other"]).default("dog"),
        name: tsch.string()
    }).title("Pet")).unique().table().default([{ type: "dog", name: "Walter" }]).minElements(1).maxElements(1)
});
type Person = tsch.Infer<typeof person>;
const personJsonSchema = person.getJsonSchemaProperty();


const personInstance = {
    pets: [
        {
            type: "reptile",
            name: "Johny"
        }
    ],
    favorite_color: "#fff",
    name: "John Doe",
    age: 51,
    gender: null,
    date: "2022/12/22",
    location: {
        city: "",
        state: ""
    }
};

//console.log(JSON.stringify(personJsonSchema, null, 3));
console.log(person.getJsonSchemaProperty().title, person.validate(personInstance));