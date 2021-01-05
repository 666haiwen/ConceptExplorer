export interface AttributeContent {
    predict: number,
    correlation: number,
    dataNum: number
};

export type OneAttribute = {
    data: AttributeContent[],
    name: string
};

export type Attribute = {
    source: number,
    attribute: OneAttribute[]
}

export type Attributes = Attribute[];

export const DEFAULE_ATTRIBUTES: Attributes = [];