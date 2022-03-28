
import {Object, Property} from 'fabric-contract-api';

@Object()
export class SchemaTransaction{

    @Property()
    public identifier: string;

    @Property()
    public operation: Schema;

    @Property()
    public protocolVersion: number;

    @Property()
    public reqId: number;

    @Property()
    public signature: string;
}

@Object()
class Schema{

    @Property()
    public data: SchemaData;

    @Property()
    public type: string;
}

class SchemaData{

    @Property()
    public attr_names: string[];

    @Property()
    public name: string;

    @Property()
    public version: string;

}