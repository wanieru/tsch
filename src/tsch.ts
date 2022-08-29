import { TschArray, TschBoolean, TschNumber, TschObject, TschString, TschType } from "./TschType";

export type Infer<T extends TschType<any>> = T["_ts"];

export function string(): TschString<string> { return new TschString<string>() }
export function number(): TschNumber { return new TschNumber() }
export function boolean(): TschBoolean { return new TschBoolean() }
export function object<TShape extends Record<string, TschType<any>>>(shape: TShape): TschObject<{ [Property in keyof TShape]: TShape[Property]["_ts"] }>
{
    return new TschObject<{ [Property in keyof TShape]: TShape[Property]["_ts"] }>(shape);
}
export function array<TElement extends TschType<any>>(elementType: TElement): TschArray<TElement["_ts"]>
{
    return new TschArray<TElement["_ts"]>(elementType);
}