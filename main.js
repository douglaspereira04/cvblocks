
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
    res.setHeader('Content-Type', 'text/plain');
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
  return "{\"id\":"+id+"}";
}

async function RetrieveCandidate(args){
  return (await candidate.submitTransaction("RetrieveCandidate", args.id)).toString();
}

async function RetrieveAllCandidates(args){
  let array = [];
  for (let index = 1; index < candidateID; index++) {
    let res = await candidate.submitTransaction("RetrieveCandidate", index);
    array.push(res);
  }
  return array.toString();
}

async function CreateResume(args){
  let id = resumeID;
  await resume.submitTransaction("CreateResume", id, args.listInfo);
  resumeID += 1;
  return "{\"id\":"+id+"}";
}

async function RetrieveResume(args){
  return (await resume.submitTransaction("RetrieveResume", args.id)).toString();
}

async function RetrieveAllResumes(args){
  let array = [];
  for (let index = 1; index < resumeID; index++) {
    let res = await resume.submitTransaction("RetrieveResume", index);
    array.push(res);
  }
  return array.toString();
}


async function CreateRecruiter(args){
  let id = recruiterID;
  await recruiter.submitTransaction("CreateRecruiter", id, args.name, args.company);
  recruiterID += 1;
  return "{\"id\":"+id+"}";
}

async function RetrieveRecruiter(args){
  return (await recruiter.submitTransaction("RetrieveRecruiter", args.id)).toString();
}

async function RetrieveAllRecruiters(args){
  let array = [];
  for (let index = 1; index < recruiterID; index++) {
    let res = await recruiter.submitTransaction("RetrieveRecruiter", index);
    array.push(res);
  }
  return array.toString();
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
  return "{\"id\":"+id+"}";
}

async function RetrieveSelectionProcess(args){
  return (await selectionprocess.submitTransaction("RetrieveSelectionProcess", args.id)).toString();
}

async function RetrieveAllSelectionProcess(args){
  let array = [];
  for (let index = 1; index < selectionprocessID; index++) {
    let res = await selectionprocess.submitTransaction("RetrieveSelectionProcess", index);
    array.push(res);
  }
  return array.toString();
}


async function AdvanceSelectionProcess(args){
  return (await selectionprocess.submitTransaction("AdvanceSelectionProcess", args.id, args.nextStage, args.rejected)).toString();
}

async function RetrieveCandidateSelectionProcess(args){
  let candidateSelectionProcess = [];
  let allSelectionProcess = (await RetrieveAllSelectionProcess(args)).split("},");
  for (let index = 0; index < allSelectionProcess.length-1; index++) {
    const selectionProcess = allSelectionProcess[index];
    let jsonselectionProcess = JSON.parse(selectionProcess+"}");
    if(jsonselectionProcess.Candidates.includes(args.id)){
      candidateSelectionProcess.push(jsonselectionProcess);
    }
  }
  const selectionProcess = allSelectionProcess[allSelectionProcess.length-1];
  let jsonselectionProcess = JSON.parse(selectionProcess);
  if(jsonselectionProcess.Candidates.includes(args.id)){
    candidateSelectionProcess.push(jsonselectionProcess);
  }
  return JSON.stringify(candidateSelectionProcess);
}

async function RetrieveRecruiterSelectionProcess(args){
  let recruiterSelectionProcess = [];
  let allSelectionProcess = (await RetrieveAllSelectionProcess(args)).split("},");
  for (let index = 0; index < allSelectionProcess.length-1; index++) {
    const selectionProcess = allSelectionProcess[index];
    let jsonselectionProcess = JSON.parse(selectionProcess+"}");
    if(jsonselectionProcess.Recruiter == args.id){
      recruiterSelectionProcess.push(jsonselectionProcess);
    }
  }
  const selectionProcess = allSelectionProcess[allSelectionProcess.length-1];
  let jsonselectionProcess = JSON.parse(selectionProcess);
  if(jsonselectionProcess.Recruiter == args.id){
    recruiterSelectionProcess.push(jsonselectionProcess);
  }
  return JSON.stringify(recruiterSelectionProcess);
}

async function SelectionProcessSearch(args){
  let matches = [];
  let words = args.words.split(" ");
  let allSelectionProcess = (await RetrieveAllSelectionProcess(args)).split("},");
  for (let index = 0; index < allSelectionProcess.length-1; index++) {
    const selectionProcess = allSelectionProcess[index];
    let jsonselectionProcess = JSON.parse(selectionProcess+"}");
    for (var i = 0; i < words.length; ++i) {
      if(jsonselectionProcess.Description.includes(words[i])
        || jsonselectionProcess.Job.includes(words[i])){
          matches.push(jsonselectionProcess);
          break;
      }
    }
  }
  const selectionProcess = allSelectionProcess[allSelectionProcess.length-1];
  let jsonselectionProcess = JSON.parse(selectionProcess);
  for (var i = 0; i < words.length; ++i) {
    if(jsonselectionProcess.Description.includes(words[i])
      || jsonselectionProcess.Job.includes(words[i])){
        matches.push(jsonselectionProcess);
        break;
    }
  }
  return JSON.stringify(matches);
}

async function RecruiterSearch(args){
  let matches = [];
  let words = args.words.split(" ");
  let allRecruiters = (await allRecruiters(args)).split("},");
  for (let index = 0; index < allRecruiters.length-1; index++) {
    const recruiter = allRecruiters[index];
    let jsonrecruiter = JSON.parse(recruiter+"}");
    for (var i = 0; i < words.length; ++i) {
      if(jsonrecruiter.Name.contains(words[i])
        || jsonrecruiter.Company.contains(words[i])){
          matches.push(jsonrecruiter);
          break;
      }
    }
  }
  const recruiter = allRecruiters[allRecruiters.length-1];
  let jsonrecruiter = JSON.parse(recruiter);
    for (var i = 0; i < words.length; ++i) {
      if(jsonrecruiter.Name.contains(words[i])
        || jsonrecruiter.Company.contains(words[i])){
          matches.push(jsonrecruiter);
          break;
      }
    }
  return JSON.stringify(matches);
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

