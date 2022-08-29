import { JsonSchemaProperty } from "./JsonSchemaPropert";

export class TschType<T, TSelf extends TschType<T, TSelf> = any>
{
    public _ts: T; //Used by Typescript for type inference
    public _type: string;

    protected _title: string | null;
    protected _description: string | null;
    protected _default: T | null;

    public constructor(type: string)
    {
        this._ts = null as any as T; //_ts is only used by Typescript for type inference, and so actually doesn't need to be assigned
        this._type = type;

        this._title = null;
        this._description = null;
        this._default = null;
    }
    public union<T2>(other: TschType<T2, any>): TschUnion<T, T2>
    {
        return new TschUnion<T, T2>(this, other);
    }
    public optional(): TschUnion<T, undefined>
    {
        return new TschUnion(this, new TschType<undefined>("undefined"));
    }
    public nullable(): TschUnion<T, null>
    {
        return new TschUnion(this, new TschType<null>("null"));
    }
    protected _baseClone(): TSelf
    {
        return new TschType<T>(this._type) as TSelf;
    }
    public _clone(): TSelf
    {
        const clone = this._baseClone();

        clone._title = this._title;
        clone._description = this._description;
        clone._default = this._default;

        return clone as TSelf;
    }
    public title(title: string): TSelf
    {
        const clone = this._clone();
        clone._title = title;
        return clone;
    }
    public description(descriptin: string): TSelf
    {
        const clone = this._clone();
        clone._description = descriptin;
        return clone;
    }
    public default(defaultValue: T): TSelf
    {
        const clone = this._clone();
        clone._default = defaultValue;
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
        return schema;
    }

    public _isOptional() { return false; }
    public _isNullable() { return false; }
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
    protected _baseClone(): TschString<T>
    {
        return new TschString<T>();
    }
    public _clone(): TschString<T>
    {
        const clone = super._clone() as TschString<T>;

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
        const clone = this._clone();
        clone._minLength = min;
        return clone;
    }
    public maxLength(max: number)
    {
        const clone = this._clone();
        clone._maxLength = max;
        return clone;
    }
    public enumeration<T extends Record<string, any>>(enumeration: (keyof T)[])
    {
        const clone = this._clone();
        clone._enum = [...enumeration as string[]];
        return clone as any as TschString<keyof T>;
    }

    private format(format: string)
    {
        const clone = this._clone();
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
    protected _baseClone(): TschNumber
    {
        return new TschNumber();
    }
    public _clone(): TschNumber
    {
        const clone = super._clone() as TschNumber;
        clone._integer = this._integer;
        clone._min = this._min;
        clone._max = this._max;
        return clone;
    }
    public integer(): TschNumber
    {
        const clone = this._clone();
        clone._integer = true;
        return clone;
    }
    public min(min: number): TschNumber
    {
        const clone = this._clone();
        clone._min = min;
        return clone;
    }
    public max(max: number): TschNumber
    {
        const clone = this._clone();
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
}
export class TschBoolean extends TschType<boolean, TschBoolean>
{
    public constructor()
    {
        super("boolean");
    }
    protected _baseClone(): TschBoolean
    {
        return new TschBoolean();
    }
    public _clone(): TschBoolean
    {
        const clone = super._clone() as TschBoolean;
        return clone;
    }
}
export class TschUnion<T1, T2> extends TschType<T1 | T2>
{
    private type1: TschType<T1>;
    private type2: TschType<T2>;
    public constructor(type1: TschType<T1>, type2: TschType<T2>)
    {
        super(`union_${type1._type}_${type2._type}`);
        this.type1 = type1;
        this.type2 = type2;
    }
    protected _baseClone()
    {
        return new TschUnion(this.type1._clone(), this.type2._clone());
    }
    public _clone(): TschUnion<T1, T2>
    {
        const clone = super._clone() as TschUnion<T1, T2>;
        clone.type1 = this.type1._clone();
        clone.type2 = this.type2._clone();
        return clone;
    }

    public getJsonSchemaProperty(): JsonSchemaProperty
    {
        const schema1: JsonSchemaProperty = this.type1._type === "undefined" ? {} as JsonSchemaProperty : this.type1.getJsonSchemaProperty();
        const schema2: JsonSchemaProperty = this.type2._type === "undefined" ? {} as JsonSchemaProperty : this.type2.getJsonSchemaProperty();
        const combined: JsonSchemaProperty = { ...schema1, ...schema2 };
        combined.type = [...(Array.isArray(schema1.type) ? schema1.type : [schema1.type]), ...(Array.isArray(schema2.type) ? schema2.type : [schema2.type])].filter(t => t !== "undefined");
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
    public _isNullable(): boolean
    {
        return this.type1._type === "null" || this.type2._type === "null";
    }
    public _isOptional(): boolean
    {
        return this.type1._type === "undefined" || this.type2._type === "undefined";
    }
}
export class TschObject<T extends Record<string, TschType<any>>> extends TschType<T, TschObject<T>>
{
    public shape: T;


    public constructor(shape: T)
    {
        super("object");
        this.shape = shape;

    }
    protected _baseClone(): TschObject<T>
    {
        return new TschObject(this.shape);
    }
    public _clone(): TschObject<T>
    {
        const clone = super._clone() as TschObject<T>;
        clone.shape = this.shape;


        return clone;
    }
    public getJsonSchemaProperty(): JsonSchemaProperty
    {
        const schema = super.getJsonSchemaProperty();

        schema.required = Object.keys(this.shape).filter(k => !this.shape[k]._isOptional());
        schema.properties = {};
        for (const key in this.shape)
        {
            schema.properties[key] = this.shape[key].getJsonSchemaProperty();
        }

        return schema;
    }


}
export class TschArray<T extends TschType<any>> extends TschType<T[], TschArray<T>>
{
    private elementType: T;

    private _format: string | null;
    private _unique: boolean;

    public constructor(elementType: T)
    {
        super("array");
        this.elementType = elementType;
        this._format = null;
        this._unique = false;
    }
    protected _baseClone(): TschArray<T>
    {
        return new TschArray(this.elementType);
    }
    public _clone(): TschArray<T>
    {
        const clone = super._clone() as TschArray<T>;
        clone.elementType = this.elementType;
        clone._format = this._format;
        clone._unique = this._unique;
        return clone;
    }
    public getJsonSchemaProperty(): JsonSchemaProperty
    {
        const schema = super.getJsonSchemaProperty();
        schema.items = this.elementType.getJsonSchemaProperty();
        if (this._format) schema.format = this._format;
        if (this._unique) schema.uniqueItems = this._unique;
        return schema;
    }

    public table()
    {
        const clone = this._clone();
        clone._format = "table";
        return clone;
    }
    public unique()
    {
        const clone = this._clone();
        clone._unique = true;
        return clone;
    }
}