
export interface Deserializable {
    deserialize(input: any): this;
}


export interface Serializable {
    serialize(input: any): Record<string, any>;
}