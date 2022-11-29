export interface JsonSchemaProperty
{
    type: string | string[],
    properties?: Record<string, JsonSchemaProperty>,
    required?: string[],
    title?: string,
    description?: string,
    default?: any,
    minimum?: number,
    maximum?: number,
    minLength?: number,
    maxLength?: number,
    format?: string
    enum?: string[],
    uniqueItems?: boolean;
    items?: JsonSchemaProperty
}