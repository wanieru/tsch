# tsch - TypeScript x JSON Schema

## What it does (currently)

- Define Typescript interfaces/types using a fluent syntax
- Typescript-centric type inference
- Conversion of types to JSON Schema for use with a JSON Editor
- Data validation (Verifying whether or not some given data fits the schema)

## What it doesn't (yet)

- Data parsing (Converting input data to something else according to the schema definition)

## How to use

```ts
import { tsch } from "tsch";

const person = tsch.object({
    name: tsch.string().description("First and Last Name").minLength(4).default("Jeremy Dorn"),
    age: tsch.number().integer().default(25).min(18).max(99).optional().title("Age"),
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

const individual : Person = {/*...*/};
const validated = person.validate(individual);
if(validated.valid)
{
  //Yay, this is a person!
}
else
{
  console.error(validated.errors);
}
```

Where the Person type is interpreted as:
```ts
type Person = {
    name: string;
    age: number | undefined;
    favorite_color: string;
    gender: "male" | "female" | "other";
    date: string;
    location: {
        city: string;
        state: string;
    };
    pets: {
        type: "other" | "cat" | "dog" | "bird" | "reptile";
        name: string;
    }[];
}
```

And the personJsonSchema object is equal to:
```json
{
  "type": "object",
  "title": "Person",
  "required": [
    "name",
    "favorite_color",
    "gender",
    "date",
    "location",
    "pets"
  ],
  "properties": {
    "name": {
      "type": "string",
      "description": "First and Last Name",
      "default": "Jeremy Dorn",
      "minLength": 4
    },
    "age": {
      "type": [
        "integer",
        "string"
      ],
      "default": 25,
      "minimum": 18,
      "maximum": 99,
      "title": "Age",
      "minLength": 5
    },
    "favorite_color": {
      "type": "string",
      "title": "favorite color",
      "default": "#ffa500",
      "format": "color"
    },
    "gender": {
      "type": "string",
      "enum": [
        "male",
        "female",
        "other"
      ]
    },
    "date": {
      "type": "string",
      "format": "date"
    },
    "location": {
      "type": "object",
      "title": "Location",
      "required": [
        "city",
        "state"
      ],
      "properties": {
        "city": {
          "type": "string",
          "default": "San Francisco"
        },
        "state": {
          "type": "string",
          "default": "CA"
        }
      }
    },
    "pets": {
      "type": "array",
      "default": [
        {
          "type": "dog",
          "name": "Walter"
        }
      ],
      "items": {
        "type": "object",
        "title": "Pet",
        "required": [
          "type",
          "name"
        ],
        "properties": {
          "type": {
            "type": "string",
            "default": "dog",
            "enum": [
              "cat",
              "dog",
              "bird",
              "reptile",
              "other"
            ]
          },
          "name": {
            "type": "string"
          }
        }
      },
      "format": "table",
      "uniqueItems": true
    }
  }
}
```