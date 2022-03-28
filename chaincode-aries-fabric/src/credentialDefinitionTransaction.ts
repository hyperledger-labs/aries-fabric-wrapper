
import {Object, Property} from 'fabric-contract-api';

@Object()
export class CredentialDefinitionTransaction{

    @Property()
    public identifier: string;

    @Property()
    public operation: CredentialDefinition;

    @Property()
    public protocolVersion: number;

    @Property()
    public reqId: number;

    @Property()
    public signature: string;
}

@Object()
class CredentialDefinition{

    @Property()
    public data: CredentialDefinitionData;

    @Property()
    public ref: number;

    @Property()
    public signature_type: string;

    @Property()
    public tag: string;

    @Property()
    public type: string;
}

@Object()
class CredentialDefinitionData{

    @Property()
    public primary: Primary;

    @Property()
    public revocation: Revocation;

}

@Object()
class Primary{

    @Property()
    public n: string;

    @Property()
    public r: r;

    @Property()
    public rctxt: string;

    @Property()
    public s: string;

    @Property()
    public z: string;
}

@Object()
class r {
    [key: string]: any
}

@Object()
class Revocation{

    @Property()
    public g: string;

    @Property()
    public g_dash: string;

    @Property()
    public h: string;

    @Property()
    public h0: string;

    @Property()
    public h1: string;

    @Property()
    public h2: string;

    @Property()
    public h_cap: string;

    @Property()
    public htilde: string;

    @Property()
    public pk: string;

    @Property()
    public u: string;

    @Property()
    public y: string;

}
