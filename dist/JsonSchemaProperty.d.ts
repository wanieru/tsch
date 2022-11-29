export interface JsonSchemaProperty {
    type: string | string[];
    properties?: Record<string, JsonSchemaProperty>;
    required?: string[];
    title?: string;
    examples?: any[];
    description?: string;
    default?: any;
    minimum?: number;
    maximum?: number;
    minLength?: number;
    maxLength?: number;
    format?: string;
    enum?: string[];
    uniqueItems?: boolean;
    minItems?: number;
    maxItems?: number;
    items?: JsonSchemaProperty;
}
