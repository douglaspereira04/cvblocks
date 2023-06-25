/*
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
*/

const shim = require('fabric-shim');
const util = require('util');

var Chaincode = class {

  // Initialize the chaincode
  async Init(stub) {
    console.info('========= Candidate Init =========');
    let ret = stub.getFunctionAndParameters();
    console.info(ret);
    let args = ret.params;
    // initialise only if 3 parameters passed.
    if (args.length != 3) {
      return shim.error('Incorrect number of arguments. Expecting 3');
    }

    if (typeof parseInt(args[0]) !== 'number' || typeof parseInt(args[2]) !== 'number') {
      return shim.error('Expecting integer value for id');
    }

    let id = args[0];
    let name = args[1];
    let resume = args[2];
    
    const candidate = {
    	ID: id,
    	Name: name,
    	Resume: resume
    };

    try {
      await stub.putState(id, Buffer.from(JSON.stringify(candidate)));
      return shim.success();
    } catch (err) {
      return shim.error(err);
    }
  }

  async Invoke(stub) {
    let ret = stub.getFunctionAndParameters();
    console.info(ret);
    let method = this[ret.fcn];
    if (!method) {
      console.log('no method of name:' + ret.fcn + ' found');
      return shim.success();
    }
    try {
      let payload = await method(stub, ret.params);
      return shim.success(payload);
    } catch (err) {
      console.log(err);
      return shim.error(err);
    }
  }

  async CreateCandidate(stub, args) {
    if (args.length != 3) {
      return shim.error('Incorrect number of arguments. Expecting 3');
    }


    if (typeof parseInt(args[0]) !== 'number' || typeof parseInt(args[2]) !== 'number') {
      return shim.error('Expecting integer value for id');
    }

    let id = args[0];
    let name = args[1];
    let resume = args[2];
    
    const candidate = {
    	ID: id,
    	Name: name,
    	Resume: resume
    };
    
    let candidateString = JSON.stringify(candidate);
    await stub.putState(id, candidateString);
    return candidateString;
  }

  async RetrieveCandidate(stub, args) {
    if (args.length != 1) {
      throw new Error('Incorrect number of arguments. Expecting id of the candidate to query');
    }

    if (typeof parseInt(args[0]) !== 'number') {
      return shim.error('Expecting integer value for id');
    }

    let id = args[0];

    // Get the state from the ledger
    let candidateBytes = await stub.getState(id);
    if (!candidateBytes) {
      let e = {};
      e.error = 'Failed to get state for ' + id;
      throw new Error(JSON.stringify(e));
    }

    let candidateString = JSON.stringify(JSON.parse(candidateBytes));
    console.info('Query Response:');
    console.info(candidateString);
    return candidateString;
  }

  async RetrieveCandidateRange(stub, args) {
    if (args.length != 2) {
      throw new Error('Incorrect number of arguments. Expecting id range of the candidates to query');
    }

    if (typeof parseInt(args[0]) !== 'number' || typeof parseInt(args[1]) !== 'number') {
      return shim.error('Expecting integer value for ids');
    }

    let startKey = args[0];
    let endKey = args[1];

    // Get the state from the ledger
    let candidatesBytes = await stub.getStateByRange(startKey, endKey);
    if (!candidateBytes) {
      let e = {};
      e.error = 'Failed to get state for ' + id;
      throw new Error(JSON.stringify(e));
    }

    let candidateString = JSON.stringify(JSON.parse(candidateBytes));
    console.info('Query Response:');
    console.info(candidateString);
    return candidateString;
  }
};

shim.start(new Chaincode());
