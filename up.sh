#!/bin/bash

cd minifabric

docker rm -f $(docker ps -a -q)

./minifab cleanup

cp ../spec.yaml ./spec.yaml

./minifab up

cp -R ../resume ./vars/chaincode/resume/
./minifab ccup -n resume -l node -p '"init","0","DummyInfo"'

cp -R ../candidate ./vars/chaincode/candidate
./minifab ccup -n candidate -l node -p '"init","0","DummyName","0"'

cp -R ../recruiter ./vars/chaincode/recruiter
./minifab ccup -n recruiter -l node -p '"init","0","DummyName","DummyCompany"'

cp -R ../selectionprocess ./vars/chaincode/selectionprocess
./minifab ccup -n selectionprocess -l node -p '"init","0","0","0","0","DummyStage","DummyDescription","DummyJob"'


cd ..

