
'use strict';

const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');


const http = require('http');

const port = 8081;

var network;
var candidate;
var resume;
var recruiter;
var selectionprocess;
var candidateID = 1;
var resumeID = 1;
var recruiterID = 1;
var selectionprocessID = 1;

async function prepare(){
  const ccpPath = path.resolve(__dirname, '.', 'connection.json');
  const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
  const walletPath = path.join('/vars/profiles/vscode/wallets', 'org0.example.com');
  const wallet = await Wallets.newFileSystemWallet(walletPath);
  console.log(`Wallet path: ${walletPath}`);
  const identity = await wallet.get('Admin');
  if (! identity) {
      console.log('Admin identity can not be found in the wallet');
      return;
  }
  const gateway = new Gateway();
  await gateway.connect(ccp, { wallet, identity: 'Admin', discovery: { enabled: true, asLocalhost: false } });
  network = await gateway.getNetwork('mychannel');
  candidate = network.getContract('candidate');
  resume = network.getContract('resume');
  recruiter = network.getContract('recruiter');
  selectionprocess = network.getContract('selectionprocess');
  
}


async function handlePost(url, body, res){
  
  if(url === '/invoke'){
    await invoke(body, res);
  }else{
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Server');
  }
}

async function invoke(body, res){
  var result;
  try {
    result = await eval(body.func)(body.args);
    

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.write(JSON.stringify(result));
    res.end();

  } catch (error) {
    console.error(`${error}`);

    res.statusCode = 400;
    res.setHeader('Content-Type', 'text/plain');
    res.write(`${error}`);
    res.end();
  }

  
}


async function CreateCandidate(args){
  let id = candidateID;
  await candidate.submitTransaction("CreateCandidate", id, args.name, args.resume);
  candidateID += 1;
  let response = {"id": id};
  return response;
}

async function RetrieveCandidate(args){
  return JSON.parse((await candidate.submitTransaction("RetrieveCandidate", args.id)).toString());
}

async function RetrieveAllCandidates(args){
  let res = JSON.parse((await candidate.submitTransaction("RetrieveCandidateRange", "1",candidateID)).toString());
  let arr = []
  res.data.forEach(record => {
    arr.push(decode(record.Record));
  });
  return {"data":arr};
}

async function CreateResume(args){
  let id = resumeID;
  await resume.submitTransaction("CreateResume", id, args.listInfo);
  resumeID += 1;
  let response = {"id": id};
  return response;
}

async function RetrieveResume(args){
  return JSON.parse((await resume.submitTransaction("RetrieveResume", args.id)).toString());
}

async function RetrieveAllResumes(args){
  let res = JSON.parse((await resume.submitTransaction("RetrieveResumeRange", "1",resumeID)).toString());
  let arr = []
  res.data.forEach(record => {
    arr.push(decode(record.Record));
  });
  return {"data":arr};
}


async function CreateRecruiter(args){
  let id = recruiterID;
  await recruiter.submitTransaction("CreateRecruiter", id, args.name, args.company);
  recruiterID += 1;
  let response = {"id": id};
  return response;
}

async function RetrieveRecruiter(args){
  return JSON.parse((await recruiter.submitTransaction("RetrieveRecruiter", args.id)).toString());
}

async function RetrieveAllRecruiters(args){
  let res = JSON.parse((await recruiter.submitTransaction("RetrieveRecruiterRange", "1",recruiterID)).toString());
  let arr = []
  res.data.forEach(record => {
    arr.push(decode(record.Record));
  });
  return {"data":arr};
}

async function CreateSelectionProcess(args){
  let id = selectionprocessID;
  await selectionprocess.submitTransaction("CreateSelectionProcess", 
    id, 
    args.recruiter, 
    args.candidates, 
    args.currStage, 
    args.stages,
    args.description,
    args.job
  );
  selectionprocessID += 1;
  let response = {"id": id};
  return response;
}

async function RetrieveSelectionProcess(args){
  return JSON.parse((await selectionprocess.submitTransaction("RetrieveSelectionProcess", args.id)).toString());
}

async function RetrieveAllSelectionProcess(args){
  let res = JSON.parse((await selectionprocess.submitTransaction("RetrieveSelectionProcessRange", "1",selectionprocessID)).toString());
  let arr = []
  res.data.forEach(record => {
    arr.push(decode(record.Record));
  });
  return {"data":arr};
}

async function AdvanceSelectionProcess(args){
  let result = (await selectionprocess.submitTransaction("AdvanceSelectionProcess", args.id, args.nextStage, args.rejected)).toString();
  return {"result": result};
}

async function RetrieveCandidateSelectionProcess(args){
  let candidateSelectionProcess = [];
  let allSelectionProcess = (await RetrieveAllSelectionProcess(args)).data;
  for (let index = 0; index < allSelectionProcess.length; index++) {
    const selectionProcess = allSelectionProcess[index];
    if(selectionProcess.Candidates.includes(args.id)){
      candidateSelectionProcess.push(selectionProcess);
    }
  }
  return {"data":candidateSelectionProcess};
}

async function RetrieveRecruiterSelectionProcess(args){
  let recruiterSelectionProcess = [];
  let allSelectionProcess = (await RetrieveAllSelectionProcess(args)).data;
  for (let index = 0; index < allSelectionProcess.length; index++) {
    const selectionProcess = allSelectionProcess[index];
    if(selectionProcess.Recruiter == args.id){
      recruiterSelectionProcess.push(selectionProcess);
    }
  }
  return {"data":recruiterSelectionProcess};
}

async function SelectionProcessSearch(args){
  let matches = [];
  let words = args.words.split(" ");
  let allSelectionProcess = (await RetrieveAllSelectionProcess(args)).data;
  for (let index = 0; index < allSelectionProcess.length; index++) {
    const selectionProcess = allSelectionProcess[index];
    for (var i = 0; i < words.length; ++i) {
      if(selectionProcess.Description.includes(words[i])
        || selectionProcess.Job.includes(words[i])){
          matches.push(selectionProcess);
          break;
      }
    }
  }
  return {"data":matches};
}

async function RecruiterSearch(args){
  let matches = [];
  let words = args.words.split(" ");
  let allRecruiters = (await RetrieveAllRecruiters(args)).data;
  for (let index = 0; index < allRecruiters.length; index++) {
    const recruiter = allRecruiters[index];
    for (var i = 0; i < words.length; ++i) {
      if(recruiter.Name.contains(words[i])
        || recruiter.Company.contains(words[i])){
          matches.push(recruiter);
          break;
      }
    }
  }
  return {"data":matches};
}

async function startServer(req, res) {
  await prepare();

  const { headers, method, url } = req;
  let body = [];
  req.on('error', (err) => {
    console.error(err);
  }).on('data', (chunk) => {
    body.push(chunk);
  }).on('end', async () => {
    body = Buffer.concat(body).toString();

    res.on('error', (err) => {
      console.error(err);
    });


    const responseBody = { headers, method, url, body };


    if (method === 'POST') {
      await handlePost(url, JSON.parse(body), res);
    }else{
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.write(JSON.stringify(responseBody));
      res.end('Server');
    }

  });
}

const server = http.createServer(startServer).listen(port);

console.log('Server running at port '+port);


function decode(buffer){
  const data = buffer.buffer.data.slice(buffer.offset,buffer.limit);
  const uint8Array = new Uint8Array(data);
  const decoder = new TextDecoder();
  const str = decoder.decode(uint8Array);
  return JSON.parse(str);
}