import { JsonSchemaProperty } from "./JsonSchemaProperty";
declare class TschValidationError {
    path: string[];
    pathString: string;
    rawMessage: string;
    message: string;
    constructor(path: string[], message: string);
    static formatPath(path: string[]): string;
}
export interface TschTypeInternal {
    _type: string;
    validateInternal(path: string[], input: any, errors: TschValidationError[]): void;
    clone(): TschType<any, any>;
    isOptional(): boolean;
    isNullable(): boolean;
    getTypeName(): string;
    isCorrectType(input: any): boolean;
}
export declare abstract class TschType<T, TSelf extends TschType<T, TSelf> = any> {
    /** Used by Typescript for type inference */
    _ts: T;
    protected _type: string;
    protected _title: string | null;
    protected _description: string | null;
    protected _default: T | null;
    protected _examples: T[] | null;
    constructor(type: string);
    union<T2>(other: TschType<T2, any>): TschUnion<T, T2>;
    optional(): TschUnion<T, undefined>;
    nullable(): TschUnion<T, null>;
    protected abstract newInstance(): TSelf;
    protected clone(): TSelf;
    title(title: string): TSelf;
    description(descriptin: string): TSelf;
    default(defaultValue: T): TSelf;
    examples(examples: T[]): TSelf;
    getJsonSchemaProperty(): JsonSchemaProperty;
    validate(input: any): {
        valid: boolean;
        errors: TschValidationError[];
    };
    protected validateInternal(path: string[], input: any, errors: TschValidationError[]): void;
    protected abstract isCorrectType(input: any): boolean;
    protected abstract validateCorrectType(path: string[], input: any, errors: TschValidationError[]): void;
    protected abstract getTypeName(): string;
    protected isOptional(): boolean;
    protected isNullable(): boolean;
}
export declare class TschString<T> extends TschType<T, TschString<T>> {
    private _format;
    private _enum;
    private _minLength;
    private _maxLength;
    constructor();
    protected newInstance(): TschString<T>;
    protected clone(): TschString<T>;
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
    protected isCorrectType(input: any): boolean;
    protected getTypeName(): string;
    protected validateCorrectType(path: string[], input: string, errors: TschValidationError[]): void;
}
export declare class TschNumber extends TschType<number, TschNumber> {
    private _integer;
    private _min;
    private _max;
    constructor();
    protected newInstance(): TschNumber;
    protected clone(): TschNumber;
    integer(): TschNumber;
    min(min: number): TschNumber;
    max(max: number): TschNumber;
    getJsonSchemaProperty(): JsonSchemaProperty;
    protected isCorrectType(input: any): boolean;
    protected getTypeName(): string;
    protected validateCorrectType(path: string[], input: number, errors: TschValidationError[]): void;
}
export declare class TschBoolean extends TschType<boolean, TschBoolean> {
    constructor();
    protected newInstance(): TschBoolean;
    protected clone(): TschBoolean;
    protected isCorrectType(input: any): boolean;
    protected getTypeName(): string;
    protected validateCorrectType(path: string[], input: boolean, errors: TschValidationError[]): void;
}
export declare class TschNull extends TschType<null, TschNull> {
    constructor();
    protected newInstance(): TschNull;
    protected clone(): TschNull;
    protected isCorrectType(input: any): boolean;
    protected getTypeName(): string;
    protected validateCorrectType(path: string[], input: null, errors: TschValidationError[]): void;
}
export declare class TschUndefined extends TschType<undefined, TschUndefined> {
    constructor();
    protected newInstance(): TschUndefined;
    protected clone(): TschUndefined;
    protected isCorrectType(input: any): boolean;
    protected getTypeName(): string;
    protected validateCorrectType(path: string[], input: undefined, errors: TschValidationError[]): void;
}
export declare class TschUnion<T1, T2> extends TschType<T1 | T2, TschUnion<T1, T2>> {
    private type1;
    private type2;
    protected Type1Internal(): TschTypeInternal;
    protected Type2Internal(): TschTypeInternal;
    constructor(type1: TschType<T1>, type2: TschType<T2>);
    protected newInstance(): TschUnion<T1, T2>;
    protected clone(): TschUnion<T1, T2>;
    getJsonSchemaProperty(): JsonSchemaProperty;
    protected isNullable(): boolean;
    protected isOptional(): boolean;
    protected isCorrectType(input: any): boolean;
    protected getTypeName(): string;
    protected validateCorrectType(path: string[], input: null, errors: TschValidationError[]): void;
}
export declare class TschObject<T extends Record<string, TschType<any>>> extends TschType<T, TschObject<T>> {
    private objectShape;
    constructor(shape?: T);
    protected newInstance(): TschObject<T>;
    protected clone(): TschObject<T>;
    shape<TNew extends Record<string, TschType<any>>>(shape: TNew): TschObject<{ [Property in keyof TNew]: TNew[Property]["_ts"]; }>;
    getJsonSchemaProperty(): JsonSchemaProperty;
    protected isCorrectType(input: any): boolean;
    protected getTypeName(): string;
    protected validateCorrectType(path: string[], input: Record<string, any>, errors: TschValidationError[]): void;
}
export declare class TschArray<T extends TschType<any>> extends TschType<T[], TschArray<T>> {
    private elementType?;
    private _format;
    private _unique;
    private _minElementCount;
    private _maxElementCount;
    constructor(elementType?: T);
    protected newInstance(): TschArray<T>;
    protected clone(): TschArray<T>;
    getJsonSchemaProperty(): JsonSchemaProperty;
    element<TNew extends TschType<any>>(elementType: TNew): TschArray<TNew["_ts"]>;
    table(): TschArray<T>;
    minElements(count: number): TschArray<T>;
    maxElements(count: number): TschArray<T>;
    unique(): TschArray<T>;
    protected isCorrectType(input: any): boolean;
    protected getTypeName(): string;
    protected validateCorrectType(path: string[], input: any[], errors: TschValidationError[]): void;
}
export {};
