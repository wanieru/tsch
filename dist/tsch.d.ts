import { TschArray, TschBoolean, TschNumber, TschObject, TschString, TschType } from "./TschType";
export declare type Infer<T extends TschType<any>> = T["_ts"];
export declare function string(): TschString<string>;
export declare function number(): TschNumber;
export declare function boolean(): TschBoolean;
export declare function object<TShape extends Record<string, TschType<any>>>(shape?: TShape): TschObject<{
    [Property in keyof TShape]: TShape[Property]["_ts"];
}>;
export declare function array<TElement extends TschType<any>>(elementType?: TElement): TschArray<TElement["_ts"]>;
export declare function any(): TschType<any>;
export declare type TschAny = TschType<any>;
