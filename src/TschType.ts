import { JsonSchemaProperty } from "./JsonSchemaProperty";
class TschValidationError
{
    path: string[];
    pathString: string;
    rawMessage: string;
    message: string;
    public constructor(path: string[], message: string)
    {
        this.path = path;
        this.pathString = TschValidationError.formatPath(path);
        this.rawMessage = message;
        this.message = `${this.pathString}: ${message}`;
    }
    public static formatPath(path: string[])
    {
        if (path.length < 1) return "root";
        return path.join(".");
    }

}

export interface TschTypeInternal
{
    _type: string;
    validateInternal(path: string[], input: any, errors: TschValidationError[]): void
    clone(): TschType<any, any>
    isOptional(): boolean
    isNullable(): boolean
    getTypeName(): string;
    isCorrectType(input: any): boolean
}

export abstract class TschType<T, TSelf extends TschType<T, TSelf> = any>
{
    /** Used by Typescript for type inference */
    public _ts: T;
    protected _type: string;

    protected _title: string | null;
    protected _description: string | null;
    protected _default: T | null;
    protected _examples: T[] | null;

    public constructor(type: string)
    {
        this._ts = null as any as T; //_ts is only used by Typescript for type inference, and so actually doesn't need to be assigned
        this._type = type;

        this._title = null;
        this._description = null;
        this._default = null;
        this._examples = null;
    }
    public union<T2>(other: TschType<T2, any>): TschUnion<T, T2>
    {
        return new TschUnion<T, T2>(this, other);
    }
    public optional(): TschUnion<T, undefined>
    {
        return new TschUnion(this, new TschUndefined());
    }
    public nullable(): TschUnion<T, null>
    {
        return new TschUnion(this, new TschNull());
    }
    protected abstract newInstance(): TSelf;
    protected clone(): TSelf
    {
        const clone = this.newInstance();

        clone._title = this._title;
        clone._description = this._description;
        clone._default = this._default;
        clone._examples = this._examples ? [...this._examples] : null;

        return clone as TSelf;
    }
    public title(title: string): TSelf
    {
        const clone = this.clone();
        clone._title = title;
        return clone;
    }
    public description(descriptin: string): TSelf
    {
        const clone = this.clone();
        clone._description = descriptin;
        return clone;
    }
    public default(defaultValue: T): TSelf
    {
        const clone = this.clone();
        clone._default = defaultValue;
        return clone;
    }
    public examples(examples: T[]): TSelf
    {
        const clone = this.clone();
        clone._examples = [...examples];
        return clone;
    }

    public getJsonSchemaProperty(): JsonSchemaProperty
    {
        const schema: JsonSchemaProperty = {
            "type": this._type
        };
        if (this._title) schema.title = this._title;
        if (this._description) schema.description = this._description;
        if (this._default) schema.default = this._default;
        if (this._examples) schema.examples = this._examples;
        return schema;
    }
    public validate(input: any): { valid: boolean, errors: TschValidationError[] }
    {
        const errors = [] as TschValidationError[];
        this.validateInternal([], input, errors);
        return { valid: errors.length == 0, errors };
    }
    protected validateInternal(path: string[], input: any, errors: TschValidationError[]): void
    {
        if (!this.isCorrectType(input))
        {
            errors.push(new TschValidationError(path, `Value has to be of type ${this.getTypeName()}`));
            return;
        }
        this.validateCorrectType(path, input, errors);
    }
    protected abstract isCorrectType(input: any): boolean
    protected abstract validateCorrectType(path: string[], input: any, errors: TschValidationError[]): void;
    protected abstract getTypeName(): string;

    protected isOptional() { return false; }
    protected isNullable() { return false; }
}

export class TschString<T> extends TschType<T, TschString<T>>
{
    private _format: string | null;
    private _enum: string[] | null;
    private _minLength: number | null;
    private _maxLength: number | null;
    public constructor()
    {
        super("string");
        this._format = null;
        this._enum = null;
        this._minLength = null;
        this._maxLength = null;
    }
    protected newInstance(): TschString<T>
    {
        return new TschString<T>();
    }
    protected clone(): TschString<T>
    {
        const clone = super.clone() as TschString<T>;

        clone._format = this._format;
        clone._enum = this._enum;
        clone._minLength = this._minLength;
        clone._maxLength = this._maxLength;
        return clone;
    }
    public getJsonSchemaProperty(): JsonSchemaProperty
    {
        const schema = super.getJsonSchemaProperty();

        if (this._format) schema.format = this._format;
        if (this._enum) schema.enum = this._enum;
        if (this._minLength) schema.minLength = this._minLength;
        if (this._maxLength) schema.maxLength = this._maxLength;
        return schema;
    }
    public minLength(min: number)
    {
        const clone = this.clone();
        clone._minLength = min;
        return clone;
    }
    public maxLength(max: number)
    {
        const clone = this.clone();
        clone._maxLength = max;
        return clone;
    }
    public enumeration<T extends Record<string, any>>(enumeration: (keyof T)[])
    {
        const clone = this.clone();
        clone._enum = [...enumeration as string[]];
        return clone as any as TschString<keyof T>;
    }

    private format(format: string)
    {
        const clone = this.clone();
        clone._format = format;
        return clone;
    }

    public color()
    {
        return this.format("color");
    }

    public date()
    {
        return this.format("date");
    }
    public email()
    {
        return this.format("email");
    }
    public password()
    {
        return this.format("password");
    }
    public textarea()
    {
        return this.format("textarea");
    }
    public url()
    {
        return this.format("url");
    }

    protected isCorrectType(input: any): boolean
    {
        return typeof input === "string";
    }
    protected getTypeName() { return "string"; }

    protected validateCorrectType(path: string[], input: string, errors: TschValidationError[]): void
    {
        if (!!this._enum && !this._enum.includes(input))
        {
            errors.push(new TschValidationError(path, `Value has to be one of the following: ${this._enum.join(", ")}`));
        }
        if (typeof this._minLength === "number" && input.length < this._minLength)
        {
            errors.push(new TschValidationError(path, `Value must be longer than ${this._minLength} characters.`));
        }
        if (typeof this._maxLength === "number" && input.length > this._maxLength)
        {
            errors.push(new TschValidationError(path, `Value must be shorter than ${this._maxLength} characters.`));
        }
        if (this._format === "color" && !/^#?[0-9a-f]{3,6}$/i.test(input))
        {
            errors.push(new TschValidationError(path, `Value must be a color hex code.`));
        }
        if (this._format === "date" && Number.isNaN(Date.parse(input)))
        {
            errors.push(new TschValidationError(path, `Value must be a date.`));
        }
        if (this._format === "email" && !/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(input))
        {
            errors.push(new TschValidationError(path, `Value must be an email.`));
        }
        if (this._format === "url" && !/^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/.test(input))
        {
            errors.push(new TschValidationError(path, `Value must be a URL.`));
        }
    }
}
export class TschNumber extends TschType<number, TschNumber>
{
    private _integer: boolean;
    private _min: number | null;
    private _max: number | null;
    public constructor()
    {
        super("number");
        this._integer = false;
        this._min = null;
        this._max = null;
    }
    protected newInstance(): TschNumber
    {
        return new TschNumber();
    }
    protected clone(): TschNumber
    {
        const clone = super.clone() as TschNumber;
        clone._integer = this._integer;
        clone._min = this._min;
        clone._max = this._max;
        return clone;
    }
    public integer(): TschNumber
    {
        const clone = this.clone();
        clone._integer = true;
        return clone;
    }
    public min(min: number): TschNumber
    {
        const clone = this.clone();
        clone._min = min;
        return clone;
    }
    public max(max: number): TschNumber
    {
        const clone = this.clone();
        clone._max = max;
        return clone;
    }
    public getJsonSchemaProperty(): JsonSchemaProperty
    {
        const schema = super.getJsonSchemaProperty();
        if (this._integer) schema.type = "integer";
        if (this._min !== null) schema.minimum = this._min;
        if (this._max !== null) schema.maximum = this._max;
        return schema;
    }
    protected isCorrectType(input: any): boolean
    {
        return typeof input === "number";
    }
    protected getTypeName() { return "number"; }

    protected validateCorrectType(path: string[], input: number, errors: TschValidationError[]): void
    {
        if (this._integer && !Number.isInteger(input))
        {
            errors.push(new TschValidationError(path, `Value has to be an integer.`));
        }
        if (typeof this._min === "number" && input < this._min)
        {
            errors.push(new TschValidationError(path, `Value must be at least ${this._min}.`));
        }
        if (typeof this._max === "number" && input > this._max)
        {
            errors.push(new TschValidationError(path, `Value must be at less than ${this._max}.`));
        }
    }
}
export class TschBoolean extends TschType<boolean, TschBoolean>
{
    public constructor()
    {
        super("boolean");
    }
    protected newInstance(): TschBoolean
    {
        return new TschBoolean();
    }
    protected clone(): TschBoolean
    {
        const clone = super.clone() as TschBoolean;
        return clone;
    }
    protected isCorrectType(input: any): boolean
    {
        return typeof input === "boolean";
    }
    protected getTypeName() { return "boolean"; }

    protected validateCorrectType(path: string[], input: boolean, errors: TschValidationError[]): void
    {
    }
}
export class TschNull extends TschType<null, TschNull>
{
    public constructor()
    {
        super("null");
    }
    protected newInstance(): TschNull
    {
        return new TschNull();
    }
    protected clone(): TschNull
    {
        const clone = super.clone() as TschNull;
        return clone;
    }

    protected isCorrectType(input: any): boolean
    {
        return input === null;
    }
    protected getTypeName() { return "null"; }
    protected validateCorrectType(path: string[], input: null, errors: TschValidationError[]): void
    {
    }
}
export class TschUndefined extends TschType<undefined, TschUndefined>
{
    public constructor()
    {
        super("undefined");
    }
    protected newInstance(): TschUndefined
    {
        return new TschUndefined();
    }
    protected clone(): TschUndefined
    {
        const clone = super.clone() as TschUndefined;
        return clone;
    }
    protected isCorrectType(input: any): boolean
    {
        return typeof input === "undefined";
    }
    protected getTypeName() { return "undefined"; }
    protected validateCorrectType(path: string[], input: undefined, errors: TschValidationError[]): void
    {
    }
}

export class TschUnion<T1, T2> extends TschType<T1 | T2, TschUnion<T1, T2>>
{
    private type1: TschType<T1>;
    private type2: TschType<T2>;

    protected Type1Internal() { return this.type1 as any as TschTypeInternal; }
    protected Type2Internal() { return this.type2 as any as TschTypeInternal; }

    public constructor(type1: TschType<T1>, type2: TschType<T2>)
    {
        super(`union_${(type1 as any as TschTypeInternal)._type}_${(type2 as any as TschTypeInternal)._type}`);
        this.type1 = type1;
        this.type2 = type2;
    }
    protected newInstance() 
    {
        return new TschUnion<T1, T2>((this.type1 as any as TschTypeInternal).clone(), (this.type2 as any as TschTypeInternal).clone());
    }
    protected clone(): TschUnion<T1, T2>
    {
        const clone = super.clone() as TschUnion<T1, T2>;
        clone.type1 = this.Type1Internal().clone();
        clone.type2 = this.Type2Internal().clone();
        return clone;
    }

    public getJsonSchemaProperty(): JsonSchemaProperty
    {
        const schema1: JsonSchemaProperty = this.Type1Internal()._type === "undefined" ? {} as JsonSchemaProperty : this.type1.getJsonSchemaProperty();
        const schema2: JsonSchemaProperty = this.Type2Internal()._type === "undefined" ? {} as JsonSchemaProperty : this.type2.getJsonSchemaProperty();
        const combined: JsonSchemaProperty = { ...schema1, ...schema2 };
        combined.type = [...(Array.isArray(schema1.type) ? schema1.type : [schema1.type]), ...(Array.isArray(schema2.type) ? schema2.type : [schema2.type])].filter(t => !!t && t !== "undefined");
        if (combined.type.length < 2) combined.type = combined.type[0];

        if (schema1.properties && schema2.properties)
        {
            combined.properties = { ...(schema1.properties ?? {}), ...(schema2.properties ?? {}) };
            if (!!schema1.required && !!schema2.required)
                combined.required = schema1.required.filter((f: string) => schema2.required?.includes(f));
            else
                combined.required = schema1.required ?? schema2.required ?? [];
        }

        if (this._title) combined.title = this._title;
        if (this._description) combined.description = this._description;
        if (this._default) combined.default = this._default;

        return combined;
    }
    protected isNullable(): boolean
    {
        return this.Type1Internal()._type === "null" || this.Type2Internal()._type === "null" || this.Type1Internal().isNullable() || this.Type2Internal().isNullable();
    }
    protected isOptional(): boolean
    {
        return this.Type1Internal()._type === "undefined" || this.Type2Internal()._type === "undefined" || this.Type1Internal().isOptional() || this.Type2Internal().isOptional();
    }

    protected isCorrectType(input: any): boolean
    {
        return this.Type1Internal().isCorrectType(input) || this.Type2Internal().isCorrectType(input);
    }
    protected getTypeName() { return `${(this.type1 as any as TschTypeInternal).getTypeName()} or ${(this.type2 as any as TschTypeInternal).getTypeName()}` }

    protected validateCorrectType(path: string[], input: null, errors: TschValidationError[]): void
    {
        if (this.Type1Internal().isCorrectType(input))
        {
            this.Type1Internal().validateInternal(path, input, errors);
        }
        if (this.Type2Internal().isCorrectType(input))
        {
            this.Type2Internal().validateInternal(path, input, errors);
        }
    }
}
export class TschObject<T extends Record<string, TschType<any>>> extends TschType<T, TschObject<T>>
{
    private objectShape: T;


    public constructor(shape?: T)
    {
        super("object");
        this.objectShape = shape ?? ({} as T);

    }
    protected newInstance(): TschObject<T>
    {
        return new TschObject(this.objectShape);
    }
    protected clone(): TschObject<T>
    {
        const clone = super.clone() as TschObject<T>;

        clone.objectShape = this.objectShape;

        return clone;
    }
    public shape<TNew extends Record<string, TschType<any>>>(shape: TNew)
    {
        const clone = this.clone() as any as TschObject<{ [Property in keyof TNew]: TNew[Property]["_ts"] }>;
        clone.objectShape = shape;
        return clone;
    }

    public getJsonSchemaProperty(): JsonSchemaProperty
    {
        const schema = super.getJsonSchemaProperty();

        schema.required = Object.keys(this.objectShape).filter(k => !(this.objectShape[k] as any as TschTypeInternal).isOptional());
        schema.properties = {};
        for (const key in this.objectShape)
        {
            schema.properties[key] = this.objectShape[key].getJsonSchemaProperty();
        }

        return schema;
    }

    protected isCorrectType(input: any): boolean
    {
        return typeof input === "object" && input !== null && !Array.isArray(input);
    }
    protected getTypeName(): string
    {
        return "object";
    }

    protected validateCorrectType(path: string[], input: Record<string, any>, errors: TschValidationError[]): void
    {
        for (const key in this.objectShape)
        {
            const child = this.objectShape[key];
            const childInternal = child as any as TschTypeInternal;
            if (!childInternal.isOptional() && !input.hasOwnProperty(key))
            {
                errors.push(new TschValidationError(path, `Property ${key} of type ${childInternal.getTypeName()} is required.`));
            }
            if (input.hasOwnProperty(key))
            {
                childInternal.validateInternal([...path, key], input[key], errors);
            }
        }
    }

}
export class TschArray<T extends TschType<any>> extends TschType<T[], TschArray<T>>
{
    private elementType?: T;

    private _format: string | null;
    private _unique: boolean;
    private _minElementCount: number | null;
    private _maxElementCount: number | null;

    public constructor(elementType?: T)
    {
        super("array");
        this.elementType = elementType;
        this._format = null;
        this._minElementCount = null;
        this._maxElementCount = null;
        this._unique = false;
    }
    protected newInstance(): TschArray<T>
    {
        return new TschArray(this.elementType);
    }
    protected clone(): TschArray<T>
    {
        const clone = super.clone() as TschArray<T>;
        clone.elementType = this.elementType;
        clone._format = this._format;
        clone._unique = this._unique;
        clone._minElementCount = this._minElementCount;
        clone._maxElementCount = this._maxElementCount;
        return clone;
    }
    public getJsonSchemaProperty(): JsonSchemaProperty
    {
        const schema = super.getJsonSchemaProperty();
        if (this.elementType) schema.items = this.elementType.getJsonSchemaProperty();
        if (this._format) schema.format = this._format;
        if (this._unique) schema.uniqueItems = this._unique;
        if (this._minElementCount) schema.minItems = this._minElementCount;
        if (this._maxElementCount) schema.maxItems = this._maxElementCount;
        return schema;
    }
    public element<TNew extends TschType<any>>(elementType: TNew)
    {
        const clone = this.clone() as any as TschArray<TNew["_ts"]>;
        clone.elementType = elementType;
        return clone;
    }

    public table()
    {
        const clone = this.clone();
        clone._format = "table";
        return clone;
    }
    public minElements(count: number)
    {
        const clone = this.clone();
        clone._minElementCount = count;
        return clone;
    }
    public maxElements(count: number)
    {
        const clone = this.clone();
        clone._maxElementCount = count;
        return clone;
    }
    public unique()
    {
        const clone = this.clone();
        clone._unique = true;
        return clone;
    }
    protected isCorrectType(input: any): boolean
    {
        return typeof input === "object" && input !== null && Array.isArray(input);
    }
    protected getTypeName(): string
    {
        return `array of ${(this.elementType as any as TschTypeInternal).getTypeName()}`;
    }
    protected validateCorrectType(path: string[], input: any[], errors: TschValidationError[]): void
    {
        const elementTypeInternal = this.elementType as any as TschTypeInternal;
        const used = new Set<string>();
        if (typeof this._minElementCount === "number" && input.length < this._minElementCount)
        {
            errors.push(new TschValidationError(path, `Array must contain at least ${this._minElementCount} elements.`));
        }
        if (typeof this._maxElementCount === "number" && input.length > this._maxElementCount)
        {
            errors.push(new TschValidationError(path, `Array must contain at most ${this._maxElementCount} elements.`));
        }
        for (let i = 0; i < input.length; i++)
        {
            const element = input[i];
            elementTypeInternal.validateInternal([...path, i.toString()], element, errors);
            if (this._unique)
            {
                const json = JSON.stringify(element);
                if (used.has(json))
                {
                    errors.push(new TschValidationError(path, "All values have to be unique."));
                }
                used.add(json);
            }
        }
    }
}