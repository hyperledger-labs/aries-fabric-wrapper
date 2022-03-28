/*
 * SPDX-License-Identifier: Apache-2.0
 */

import {Context, Contract, Info, Transaction} from 'fabric-contract-api';
import {NymTransaction} from './nymTransaction';
import {SchemaTransaction} from './schemaTransaction';
import {CredentialDefinitionTransaction} from './credentialDefinitionTransaction';

@Info({title: 'SSIChaincode', description: 'Smart contract for enabling SSI in Fabric'})
export class SSISmartContract extends Contract {

    // CreateTransaction creates a new transaction to the world state with given details.
    @Transaction()
    public async CreateTransaction(ctx: Context, transaction: string, type: string, network: string): Promise<void> {

        let id: string;
        
        switch(type)
        {
            case "nym":
                const nym: NymTransaction = JSON.parse(transaction);
                id = "did:" + network + ":" + nym.operation.dest;
                await ctx.stub.putState(id, Buffer.from(JSON.stringify(nym)));
                break;

            case "schema":
                const schema: SchemaTransaction  = JSON.parse(transaction);
                id = schema.identifier + ":2:" + schema.operation.data.name + ":" + schema.operation.data.version;  
                await ctx.stub.putState(id, Buffer.from(JSON.stringify(schema)));
                break;

            case "credentialDefinition":
                const credentialDefinition: CredentialDefinitionTransaction  = JSON.parse(transaction);
                id = credentialDefinition.identifier + ":3:" + credentialDefinition.operation.signature_type + ":" + credentialDefinition.operation.ref + ":" + credentialDefinition.operation.tag;   
                await ctx.stub.putState(id, Buffer.from(JSON.stringify(credentialDefinition)));
                break;

        }

    }

    // ReadTransaction returns the transaction stored in the world state with given id.
    @Transaction(false)
    public async ReadTransaction(ctx: Context, id: string, type: string): Promise<any> {
        const txnJSON = await ctx.stub.getState(id); // get the transaction from chaincode state
        if (!txnJSON || txnJSON.length === 0) {
            throw new Error(`The txn ${id} does not exist`);
        }

        const transaction = await this.BinaryToArray(txnJSON);

        switch(type)
        {
            case "nym":
                const nym: NymTransaction = transaction as NymTransaction

                let nymReturn = {
                    "did": nym.operation.dest,
                    "verkey": nym.operation.verkey,
                    "role": nym.operation.role
                }

                return nymReturn;

            case "schema":
                const schema: SchemaTransaction = transaction as SchemaTransaction

                let schemaReturn = {
                    "ver": "1.0",
                    "id": id,
                    "name": schema.operation.data.name,
                    "version": schema.operation.data.version,
                    "attrNames": schema.operation.data.attr_names,
                    "seqNo": 0
                } 

                return schemaReturn;

            case "credentialDefinition":
                const credentialDefinition: CredentialDefinitionTransaction = transaction as CredentialDefinitionTransaction

                let credentialDefinitionReturn = {
                    "ver": "1.0",
                    "id": id,
                    "schemaId": "0",
                    "type": credentialDefinition.operation.signature_type,
                    "tag": credentialDefinition.operation.tag,
                    "value": {
                        "primary": credentialDefinition.operation.data.primary,
                        "revocation": credentialDefinition.operation.data.revocation
                    }
                }

                return credentialDefinitionReturn;

        }


        return txnJSON.toString();
    }

    // UpdateTransaction updates an existing transaction in the world state with provided parameters.
    @Transaction()
    public async UpdateTransaction(ctx: Context, transaction: string, type: string, id: string): Promise<void> {
        
        const txnJSON = await ctx.stub.getState(id);
        const exists = txnJSON && txnJSON.length > 0;
        
        if (!exists) {
            throw new Error(`The transaction ${id} does not exist`);
        }

        switch(type)
        {
            case "nym":
                const nym: NymTransaction = JSON.parse(transaction);
                await ctx.stub.putState(id, Buffer.from(JSON.stringify(nym)));
                break;

            case "schema":
            case "credentialDefinition":
                throw new Error(`The ${type} transaction cannot be updated`);

        }

    }

    // DeleteTransaction deletes a given transaction from the world state.
    @Transaction()
    public async DeleteTransaction(ctx: Context, id: string): Promise<void> {

        const txnJSON = await ctx.stub.getState(id);
        const exists = txnJSON && txnJSON.length > 0;

        if (!exists) {
            throw new Error(`The transaction ${id} does not exist`);
        }
        await ctx.stub.deleteState(id);
    }

    public async BinaryToArray(binArray) {
        var str = "";
        for (var i = 0; i < binArray.length; i++) {
            str += String.fromCharCode(parseInt(binArray[i]));
        } 
        return JSON.parse(str)
    }

}