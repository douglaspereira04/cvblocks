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
    console.info('========= Selection Init =========');
    let ret = stub.getFunctionAndParameters();
    console.info(ret);
    let args = ret.params;
    // initialise only if 7 parameters passed.
    if (args.length != 7) {
      return shim.error('Incorrect number of arguments. Expecting 7');
    }

    if (typeof parseInt(args[0]) !== 'number' || typeof parseInt(args[1]) !== 'number' || typeof parseInt(args[2]) !== 'number' || typeof parseInt(args[3]) !== 'number') {
      return shim.error('Expecting integer value for id');
    }
    
    let id = args[0];
    let recruiter = args[1];
    let candidates = args[2].split(",");
    let currStage = args[3];
    let stages = args[4].split(",");
    let description = args[5];
    let job = args[6];
    
    const selectionprocess = {
    	ID: id,
    	CurrentStage: currStage,
    	Stages: stages,
    	Candidates: candidates,
    	Rejected: [],
    	Recruiter: recruiter,
    	Description: description,
    	Job: job
    };

    try {
      await stub.putState(id, Buffer.from(JSON.stringify(selectionprocess)));
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
  
  async CreateSelectionProcess(stub, args) {
    if (args.length != 7) {
      return shim.error('Incorrect number of arguments. Expecting 7');
    }

    if (typeof parseInt(args[0]) !== 'number' || typeof parseInt(args[1]) !== 'number' || typeof parseInt(args[2]) !== 'number' || typeof parseInt(args[3]) !== 'number') {
      return shim.error('Expecting integer value for id');
    }

    let id = args[0];
    let recruiter = args[1];
    let candidates = args[2].split(",");
    let currStage = args[3];
    let stages = args[4].split(",");
    let description = args[5];
    let job = args[6];
    
    const selectionprocess = {
    	ID: id,
    	CurrentStage: currStage,
    	Stages: stages,
    	Candidates: candidates,
    	Rejected: [],
    	Recruiter: recruiter,
    	Description: description,
    	Job: job
    };

    let selectionprocessString = JSON.stringify(selectionprocess);
    await stub.putState(id, selectionprocessString);
    return Buffer.from("DONE");
  }

  async RetrieveSelectionProcess(stub, args) {
    if (args.length != 1) {
      throw new Error('Incorrect number of arguments. Expecting id of the selectionprocess to query');
    }

    if (typeof parseInt(args[0]) !== 'number') {
      return shim.error('Expecting integer value for id');
    }

    let id = args[0];

    // Get the state from the ledger
    let selectionprocessBytes = await stub.getState(id);
    if (!selectionprocessBytes) {
      let e = {};
      e.error = 'Failed to get state for ' + id;
      throw new Error(JSON.stringify(e));
    }

    let selectionprocessString = JSON.stringify(JSON.parse(selectionprocessBytes));
    console.info('Query Response:');
    console.info(selectionprocessString);
    return selectionprocessBytes;
  }

  async RetrieveSelectionProcessRange(stub, args) {
    if (args.length != 2) {
      throw new Error('Incorrect number of arguments. Expecting id range of the selectionprocess to query');
    }

    if (typeof parseInt(args[0]) !== 'number' || typeof parseInt(args[1]) !== 'number') {
      return shim.error('Expecting integer value for ids');
    }

    let startKey = args[0];
    let endKey = args[1];
    let allResults = [];

    // Get the state from the ledger
    let iterator = await stub.getStateByRange(startKey, endKey);
    if (!iterator) {
      let e = {};
      e.error = 'Failed to get state for ' + id;
      throw new Error(JSON.stringify(e));
    }else{
      while (true) {
        let res = await iterator.next()
        if (res.value && res.value.value.toString()) {
            let jsonRes = {};
            console.log(res.value.value.toString());

            jsonRes.Key = res.value.key;
          try {
            jsonRes.Record = res.value.value;
          } catch (err) {
            console.log(err);
            jsonRes.Record = res.value.value;
          }

          allResults.push(jsonRes);
        }
        if (res.done) {
          await iterator.close();
          break;
        }
      }
    }
    
    let r = {"data": allResults};
    return Buffer.from(JSON.stringify(r));
  }
  
  async AdvanceSelectionProcess(stub, args) {
    if (args.length != 3) {
      throw new Error('Incorrect number of arguments. Expecting id of the selectionprocess to update');
    }

    if (typeof parseInt(args[0]) !== 'number' || typeof parseInt(args[1]) !== 'number') {
      return shim.error('Expecting integer value for id and stage');
    }

    let id = args[0];
    let nextStage = args[1];
    let rejected = args[2].split(",");
    

    // Get the state from the ledger
    let selectionprocessBytes = await stub.getState(id);
    if (!selectionprocessBytes) {
      let e = {};
      e.error = 'Failed to get state for ' + id;
      throw new Error(JSON.stringify(e));
    }

    let selectionprocess = JSON.parse(selectionprocessBytes);
    selectionprocess.CurrentStage = nextStage;
    selectionprocess.Rejected = selectionprocess.Rejected.concat(rejected);

    let updatedSelectionprocessString = JSON.stringify(selectionprocess);
    await stub.putState(id, Buffer.from(updatedSelectionprocessString));
    return Buffer.from("DONE");
  }
};

shim.start(new Chaincode());
