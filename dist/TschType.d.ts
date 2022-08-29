import { JsonSchemaProperty } from "./JsonSchemaPropert";
export declare class TschType<T, TSelf extends TschType<T, TSelf> = any> {
    _ts: T;
    _type: string;
    protected _title: string | null;
    protected _description: string | null;
    protected _default: T | null;
    constructor(type: string);
    union<T2>(other: TschType<T2, any>): TschUnion<T, T2>;
    optional(): TschUnion<T, undefined>;
    nullable(): TschUnion<T, null>;
    protected _baseClone(): TSelf;
    _clone(): TSelf;
    title(title: string): TSelf;
    description(descriptin: string): TSelf;
    default(defaultValue: T): TSelf;
    getJsonSchemaProperty(): JsonSchemaProperty;
    _isOptional(): boolean;
    _isNullable(): boolean;
}
export declare class TschString<T> extends TschType<T, TschString<T>> {
    private _format;
    private _enum;
    private _minLength;
    private _maxLength;
    constructor();
    protected _baseClone(): TschString<T>;
    _clone(): TschString<T>;
    getJsonSchemaProperty(): JsonSchemaProperty;
    minLength(min: number): TschString<T>;
    maxLength(max: number): TschString<T>;
    enumeration<T extends Record<string, any>>(enumeration: (keyof T)[]): TschString<keyof T>;
    private format;
    color(): TschString<T>;
    date(): TschString<T>;
    email(): TschString<T>;
    password(): TschString<T>;
    textarea(): TschString<T>;
    url(): TschString<T>;
}
export declare class TschNumber extends TschType<number, TschNumber> {
    private _integer;
    private _min;
    private _max;
    constructor();
    protected _baseClone(): TschNumber;
    _clone(): TschNumber;
    integer(): TschNumber;
    min(min: number): TschNumber;
    max(max: number): TschNumber;
    getJsonSchemaProperty(): JsonSchemaProperty;
}
export declare class TschBoolean extends TschType<boolean, TschBoolean> {
    constructor();
    protected _baseClone(): TschBoolean;
    _clone(): TschBoolean;
}
export declare class TschUnion<T1, T2> extends TschType<T1 | T2> {
    private type1;
    private type2;
    constructor(type1: TschType<T1>, type2: TschType<T2>);
    protected _baseClone(): TschUnion<unknown, unknown>;
    _clone(): TschUnion<T1, T2>;
    getJsonSchemaProperty(): JsonSchemaProperty;
    _isNullable(): boolean;
    _isOptional(): boolean;
}
export declare class TschObject<T extends Record<string, TschType<any>>> extends TschType<T, TschObject<T>> {
    shape: T;
    constructor(shape: T);
    protected _baseClone(): TschObject<T>;
    _clone(): TschObject<T>;
    getJsonSchemaProperty(): JsonSchemaProperty;
}
export declare class TschArray<T extends TschType<any>> extends TschType<T[], TschArray<T>> {
    private elementType;
    private _format;
    private _unique;
    constructor(elementType: T);
    protected _baseClone(): TschArray<T>;
    _clone(): TschArray<T>;
    getJsonSchemaProperty(): JsonSchemaProperty;
    table(): TschArray<T>;
    unique(): TschArray<T>;
}
