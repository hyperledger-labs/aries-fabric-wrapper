
import {Object, Property} from 'fabric-contract-api';

@Object()
export class NymTransaction{

    @Property()
    public identifier: string;

    @Property()
    public operation: Nym;

    @Property()
    public protocolVersion: number;

    @Property()
    public reqId: number;

    @Property()
    public signature: string;

}

@Object()
class Nym {

    @Property()
    public alias: string;

    @Property()
    public dest: string;

    @Property()
    public role: string;

    @Property()
    public type: string;

    @Property()
    public verkey: string;

}