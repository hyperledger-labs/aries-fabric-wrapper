import express from 'express';

import { Gateway, GatewayOptions } from 'fabric-network';
import * as path from 'path';
import { buildCCPOrg1, buildCCPOrg2, buildWallet, prettyJSONString } from './utils//AppUtil';
import { buildCAClient, enrollAdmin, registerAndEnrollUser } from './utils/CAUtil';

import FabricCAServices from 'fabric-ca-client';
import { Wallet, Wallets } from 'fabric-network';

const channelName = 'mychannel';
const chaincodeName = 'basic';
let mspOrg : string;
let walletPath : string;
let orgUserId : string;

const app = express();
app.use(express.json());

let ccp: Record<string, any>;
let caClient: FabricCAServices;
let wallet: Wallet;
let gateway: Gateway = new Gateway();
let gatewayOpts: GatewayOptions;

async function setupOrganization(walletDetails: Map<string, string>){

    walletPath = path.join(__dirname, walletDetails.get("walletOrg"));
    wallet = await buildWallet(walletPath);

}

async function useOrganization(organizationDetails: Map<string, string>){

    let organization = organizationDetails.get("organization");
    let ca = organizationDetails.get("ca");
    let department = organizationDetails.get("department");
    mspOrg = organizationDetails.get("mspOrg");
    orgUserId = organizationDetails.get("orgUserId");

    if (organization == "org1")
    {
        ccp = buildCCPOrg1();
    }
    else
    {
        ccp = buildCCPOrg2();
    }

    caClient = buildCAClient(ccp, ca);

    await enrollAdmin(caClient, wallet, mspOrg);
    await registerAndEnrollUser(caClient, wallet, mspOrg, orgUserId, department);

    gatewayOpts = {
        wallet,
        identity: orgUserId,
        discovery: { enabled: true, asLocalhost: true },
    };

}

async function main(txn: string, type: string) {
    try {
        await gateway.connect(ccp, gatewayOpts);
        const network = await gateway.getNetwork(channelName);
        const contract = network.getContract(chaincodeName);
        console.log('\n--> Submit Transaction: InitLedger, function creates the initial set of transactions on the ledger');
        await contract.submitTransaction("CreateTransaction", txn, type);
        console.log('*** Result: committed');
        console.log("\n\n --- Contract: " + contract  + " ---- \n\n");
    } finally {
        // Disconnect from the gateway when the application is closing
        // This will close all connections to the network
        gateway.disconnect();
    }
}

async function getTransaction(type: string, did: string){

    try {
        await gateway.connect(ccp, gatewayOpts);

        const network = await gateway.getNetwork(channelName);

        const contract = network.getContract(chaincodeName);

        let contractFunction: string;
        
        switch (type)
        {
            case "nym":
                contractFunction = "ReadNymTransaction";
                break;
            case "attrib":
                contractFunction = "ReadAttribTransaction";
                break;
        }

        console.log('\n--> Evaluate Transaction: ReadTransaction, function returns an transaction with a given ID');
        let result = await contract.evaluateTransaction(contractFunction, did);
        console.log(`*** Result: ${prettyJSONString(result.toString())}`);

    } finally {
        // Disconnect from the gateway when the application is closing
        // This will close all connections to the network
        gateway.disconnect();
    }

}

async function getMainTransaction(){

    try {
        await gateway.connect(ccp, gatewayOpts);

        const network = await gateway.getNetwork(channelName);

        const contract = network.getContract(chaincodeName);


        console.log('\n--> Evaluate Transaction: ReadTransaction, function returns an transaction with a given ID');
        let result = await contract.evaluateTransaction("ReadSchemaTransaction", "Degree", "1.0");
        console.log(`*** Result: ${prettyJSONString(result.toString())}`);

        console.log('\n--> Evaluate Transaction: ReadTransaction, function returns an transaction with a given ID');
        result = await contract.evaluateTransaction("ReadCredentialDefinitionTransaction", "12", "CL", "some_tag");
        console.log(`*** Result: ${prettyJSONString(result.toString())}`);

    } finally {
        // Disconnect from the gateway when the application is closing
        // This will close all connections to the network
        gateway.disconnect();
    }

}

app.post('/setup', async function(request, response){
    
    let body = request.body; 
    let walletDetails = new Map<string, string>();
    for (let value in body) {  
        walletDetails.set(value, body[value])  
        }
    await setupOrganization(walletDetails);

})

app.post('/useorganization', async function(request, response){

    let body = request.body;
    let organizationDetails = new Map<string, string>();
    for (let value in body) {
        organizationDetails.set(value, body[value])
    }
    await useOrganization(organizationDetails);

})

app.post('/test/:type', async function(request, response){
   let txnJson = request.body;      // your JSON
   let type = request.params.type;
   
   await main(JSON.stringify(txnJson), type);
   
   response.send(txnJson);	 // echo the result back

});

app.post('/getTransaction/:type/:did', async function(request, response){

    let type = request.params.type;
    let did = request.params.did;

    await getTransaction(type, did);
});

app.post('/getMainTransaction', async function(request, response){

    await getMainTransaction();

})

app.listen(3000);
