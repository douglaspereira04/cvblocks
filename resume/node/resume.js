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
    console.info('========= Resume Init =========');
    let ret = stub.getFunctionAndParameters();
    console.info(ret);
    let args = ret.params;
    // initialise only if 2 parameters passed.
    if (args.length != 2) {
      return shim.error('Incorrect number of arguments. Expecting 2');
    }

    if (typeof parseInt(args[0]) !== 'number') {
      return shim.error('Expecting integer value for id');
    }

    let id = args[0];
    let listInfo = args[1].split(",");
    
    const resume = {
    	ID: id,
    	ListInfo: listInfo
    };

    try {
      await stub.putState(id, Buffer.from(JSON.stringify(resume)));
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

  async CreateResume(stub, args) {
    if (args.length != 2) {
      return shim.error('Incorrect number of arguments. Expecting 3');
    }


    if (typeof parseInt(args[0]) !== 'number') {
      return shim.error('Expecting integer value for id');
    }

    let id = args[0];
    let listInfo = args[1].split(",");
    
    const resume = {
    	ID: id,
    	ListInfo: listInfo
    };
    
    let resumeString = JSON.stringify(resume);
    await stub.putState(id, resumeString);
    return Buffer.from("DONE");
  }

  async RetrieveResume(stub, args) {
    if (args.length != 1) {
      throw new Error('Incorrect number of arguments. Expecting id of the resume to query');
    }

    if (typeof parseInt(args[0]) !== 'number') {
      return shim.error('Expecting integer value for id');
    }

    let id = args[0];

    // Get the state from the ledger
    let resumeBytes = await stub.getState(id);
    if (!resumeBytes) {
      let e = {};
      e.error = 'Failed to get state for ' + id;
      throw new Error(JSON.stringify(e));
    }

    let resumeString = JSON.stringify(JSON.parse(resumeBytes));
    console.info('Query Response:');
    console.info(resumeString);
    return resumeBytes;
  }
  
  
  async UpdateResume(stub, args) {
    if (args.length != 2) {
      throw new Error('Incorrect number of arguments. Expecting id of the resume to update');
    }

    if (typeof parseInt(args[0]) !== 'number') {
      return shim.error('Expecting integer value for id');
    }

    let id = args[0];
    let listInfo = args[1].split(",");


    // Get the state from the ledger
    let resumeBytes = await stub.getState(id);
    if (!resumeBytes) {
      let e = {};
      e.error = 'Failed to get state for ' + id;
      throw new Error(JSON.stringify(e));
    }
    
    const resume = {
    	ID: id,
    	ListInfo: listInfo
    };
    
    let resumeString = JSON.stringify(resume);
    await stub.putState(id, resumeString);
    return Buffer.from("DONE");
  }

  async RetrieveResumeRange(stub, args) {
    if (args.length != 2) {
      throw new Error('Incorrect number of arguments. Expecting id range of the resumes to query');
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

};



shim.start(new Chaincode());
