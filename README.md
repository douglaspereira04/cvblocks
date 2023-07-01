# CVBlocks
This project provides back-end environment to CVBlocks, an application designed to improve selection processes using **blockchain** technology. 
The application was developed as a Blockchain and Cryptocurrencies Technologies course assignment.

[Minifabric](https://github.com/hyperledger-labs/minifabric) is used to stand up a Fabric network in order to make available the required Smart Contracts. The **chaincode** was developed with **Node.js**.

A web server, also developed with Node.js, provides an easy(insecure and unsafe) way to invoke the Smart Contracts. This interface is used by the front-end application.

## Prerequisites
- [docker](https://www.docker.com/) (18.03 or newer) environment;
- [curl](https://curl.se/) is necessary to run the invocation examples.

## Installation
Run ```up.sh``` to bring up Minifabric environment and install the Smart Contracts. This step can take a while. 
During the start up, Minifabric creates the ```minifabric/vars/``` in which the user might not have write permissions. An easy way to guarantee that the installation will run as expected is to run as ```sudo```. So run:
```bash
sudo ./up.sh
```
To run the server:
```bash
./app.sh up
```
After that, the output should display the **address of the server**.

# Smart Contracts
The Smart Contracts chaincode are written in Node.js in the files:
- ```candidate/node/candidate.js```
- ```recruiter/node/recruiter.js```
- ```resume/node/resume.js```
- ```selectionprocess/node/selectionprocess.js```

# Examples
The ```examples.sh``` script contains examples of requests. Run
```bash
./examples.sh <ipaddress>:<port>
```
to make some requests.
