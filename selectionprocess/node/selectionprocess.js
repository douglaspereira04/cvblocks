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
    
    let key = stub.createCompositeKey('selectionprocess', [recruiter, id]);
    
    const selectionprocess = {
    	ID: id,
    	CurrentStage: currStage,
    	Stages: stages,
    	Candidates: candidates,
    	Recruiter: recruiter,
    	Description: description,
    	Job: job
    };

    try {
      await stub.putState(key, Buffer.from(JSON.stringify(selectionprocess)));
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

    let key = stub.createCompositeKey('selectionprocess', [recruiter, id]);
    
    const selectionprocess = {
    	ID: id,
    	CurrentStage: currStage,
    	Stages: stages,
    	Candidates: candidates,
    	Recruiter: recruiter,
    	Description: description,
    	Job: job
    };

    let selectionprocessString = JSON.stringify(selectionprocess);
    await stub.putState(key, selectionprocessString);
    return selectionprocessString;
  }

  async RetrieveSelectionProcessByRecruiter(stub, args) {
    if (args.length != 1) {
      throw new Error('Incorrect number of arguments. Expecting id of the selection process to query');
    }

    if (typeof parseInt(args[0]) !== 'number') {
      return shim.error('Expecting integer value for id');
    }

    let recruiter = args[0];

    // Get the state from the ledger
    let allResults = [];
    let res = { done: false, value: null };
    let jsonRes = {};
    res = await stub.getStateByPartialCompositeKey('selectionprocess', [recruiter]);
  
    while (!res.done) {
      jsonRes.Key = res.value.key;

      try {
        jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
        allResults.push(jsonRes);
        res = await iterator.next();
      }catch (err) {
          console.log(err);
          return {}
      }
    }
    await iterator.close();

    console.info('Query Response:');
    console.info(JSON.stringify(allResults));
    return JSON.stringify(allResults);
  }

  async RetrieveSelectionProcess(stub, args) {
    if (args.length != 2) {
      throw new Error('Incorrect number of arguments. Expecting id of the selection process to query');
    }

    if (typeof parseInt(args[0]) !== 'number' || typeof parseInt(args[1]) !== 'number') {
      return shim.error('Expecting integer value for id');
    }

    let id = args[0];
    let recruiter = args[1];
    let key = stub.createCompositeKey('selectionprocess', [recruiter, id]);

    // Get the state from the ledger
    let selectionprocessBytes = await stub.getState(key);
    if (!selectionprocessBytes) {
      let e = {};
      e.error = 'Failed to get state for ' + id;
      throw new Error(JSON.stringify(e));
    }

    let selectionprocessString = JSON.stringify(JSON.parse(selectionprocessBytes));
    console.info('Query Response:');
    console.info(selectionprocessString);
    return selectionprocessString;
  }

  async RetrieveSelectionProcessRange(stub, args) {
    if (args.length != 2) {
      throw new Error('Incorrect number of arguments. Expecting id range of the seleection processes to query');
    }

    let startKey = stub.createCompositeKey('selectionprocess', args[0].split(","));
    let endKey = stub.createCompositeKey('selectionprocess', args[1].split(","));

    // Get the state from the ledger
    let selectionprocessBytes = await stub.getStateByRange(startKey, endKey);
    if (!selectionprocessBytes) {
      let e = {};
      e.error = 'Failed to get state for ' + startKey + ' to ' + endKey;
      throw new Error(JSON.stringify(e));
    }
    
    let selectionprocessString = JSON.stringify(JSON.parse(selectionprocessBytes));
    console.info('Query Response:');
    console.info(selectionprocessString);
    return selectionprocessString;
  }
  
  async AdvanceSelectionProcess(stub, args) {
    if (args.length != 4) {
      throw new Error('Incorrect number of arguments. Expecting id of the resume to update');
    }

    if (typeof parseInt(args[0]) !== 'number' || typeof parseInt(args[1]) !== 'number' || typeof parseInt(args[2]) !== 'number') {
      return shim.error('Expecting integer value for id and stage');
    }

    let id = args[0];
    let nextStage = args[1];
    let recruiter = args[2];
    let droped = args[3].split(",");
    
    let key = stub.createCompositeKey('selectionprocess', [recruiter, id]);

    // Get the state from the ledger
    let selectionprocessBytes = await stub.getState(key);
    if (!selectionprocessBytes) {
      let e = {};
      e.error = 'Failed to get state for ' + id;
      throw new Error(JSON.stringify(e));
    }

    let selectionprocess = JSON.parse(selectionprocessBytes);
    
    let remaining = [];
    selectionprocess.Candidates.forEach((candidate) => {
      if(!droped.includes(candidate)){
        remaining.push(candidate);
      };
    });
    
    const updatedSelectionprocess = {
      ID: selectionprocess.ID,
      CurrentStage: nextStage,
      Stages: selectionprocess.Stages,
      Candidates: remaining,
      Recruiter: selectionprocess.Recruiter,
      Description: selectionprocess.Description,
      Job: selectionprocess.Job
    };

    let updatedSelectionprocessString = JSON.stringify(updatedSelectionprocess);
    await stub.putState(id, Buffer.from(updatedSelectionprocessString));
    return updatedSelectionprocessString;
  }
};

shim.start(new Chaincode());
