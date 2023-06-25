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
    console.info('========= Recruiter Init =========');
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
    let company = args[2];
    
    const recruiter = {
    	ID: id,
    	Name: name,
    	Company: company
    };

    try {
      await stub.putState(id, Buffer.from(JSON.stringify(recruiter)));
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

  async CreateRecruiter(stub, args) {
    if (args.length != 3) {
      return shim.error('Incorrect number of arguments. Expecting 3');
    }

    if (typeof parseInt(args[0]) !== 'number' || typeof parseInt(args[2]) !== 'number') {
      return shim.error('Expecting integer value for id');
    }

    let id = args[0];
    let name = args[1];
    let company = args[2];
    
    const recruiter = {
    	ID: id,
    	Name: name,
    	Company: company
    };
    
    let recruiterString = JSON.stringify(recruiter);
    await stub.putState(id, recruiterString);
    return recruiterString;
  }

  async RetrieveRecruiter(stub, args) {
    if (args.length != 1) {
      throw new Error('Incorrect number of arguments. Expecting id of the recruiter to query');
    }

    if (typeof parseInt(args[0]) !== 'number') {
      return shim.error('Expecting integer value for id');
    }

    let id = args[0];

    // Get the state from the ledger
    let recruiterBytes = await stub.getState(id);
    if (!recruiterBytes) {
      let e = {};
      e.error = 'Failed to get state for ' + id;
      throw new Error(JSON.stringify(e));
    }

    let recruiterString = JSON.stringify(JSON.parse(recruiterBytes));
    console.info('Query Response:');
    console.info(recruiterString);
    return recruiterString;
  }

  async RetrieveRecruiterRange(stub, args) {
    if (args.length != 2) {
      throw new Error('Incorrect number of arguments. Expecting id range of the recruiters to query');
    }

    if (typeof parseInt(args[0]) !== 'number' || typeof parseInt(args[1]) !== 'number') {
      return shim.error('Expecting integer value for ids');
    }

    let startKey = args[0];
    let endKey = args[1];

    // Get the state from the ledger
    let recruiterBytes = await stub.getStateByRange(startKey, endKey);
    if (!recruiterBytes) {
      let e = {};
      e.error = 'Failed to get state for ' + id;
      throw new Error(JSON.stringify(e));
    }

    let recruiterString = JSON.stringify(JSON.parse(recruiterBytes));
    console.info('Query Response:');
    console.info(recruiterString);
    return recruiterString;
  }
};

shim.start(new Chaincode());
