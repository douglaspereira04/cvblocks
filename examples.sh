#!/bin/bash

invocation="http://$1/invoke"

curl -i -X POST -H 'Content-Type: application/json' -d '{"func": "CreateResume", "args": {"listInfo":["Info0","Info1","Info2"]}}' $invocation

curl -i -X POST -H 'Content-Type: application/json' -d '{"func": "RetrieveResume", "args": {"id":"1"}}' $invocation


curl -i -X POST -H 'Content-Type: application/json' -d '{"func": "CreateResume", "args": {"listInfo":["Info4","Info12","Info314"]}}' $invocation

curl -i -X POST -H 'Content-Type: application/json' -d '{"func": "RetrieveResume", "args": {"id":"2"}}' $invocation


curl -i -X POST -H 'Content-Type: application/json' -d '{"func": "CreateCandidate", "args": {"name":"Douglas","resume":"1"}}' $invocation

curl -i -X POST -H 'Content-Type: application/json' -d '{"func": "RetrieveCandidate", "args": {"id":"1"}}' $invocation

curl -i -X POST -H 'Content-Type: application/json' -d '{"func": "CreateCandidate", "args": {"name":"Joao","resume":"2"}}' $invocation

curl -i -X POST -H 'Content-Type: application/json' -d '{"func": "RetrieveCandidate", "args": {"id":"2"}}' $invocation

curl -i -X POST -H 'Content-Type: application/json' -d '{"func": "CreateRecruiter", "args": {"name":"Pedro","company":"UFSC"}}' $invocation

curl -i -X POST -H 'Content-Type: application/json' -d '{"func": "RetrieveRecruiter", "args": {"id":"1"}}' $invocation

curl -i -X POST -H 'Content-Type: application/json' -d '{"func": "CreateRecruiter", "args": {"name":"Carlos","company":"UFSC"}}' $invocation

curl -i -X POST -H 'Content-Type: application/json' -d '{"func": "RetrieveRecruiter", "args": {"id":"2"}}' $invocation

curl -i -X POST -H 'Content-Type: application/json' -d '{"func": "RetrieveAllResumes", "args": {}}' $invocation

curl -i -X POST -H 'Content-Type: application/json' -d '{"func": "RetrieveAllCandidates", "args": {}}' $invocation

curl -i -X POST -H 'Content-Type: application/json' -d '{"func": "RetrieveAllRecruiters", "args": {}}' $invocation

curl -i -X POST -H 'Content-Type: application/json' -d '{"func": "CreateSelectionProcess", "args": {"recruiter":"1", "candidates":["1","2"],"currStage":"0","stages":["Inicio","Fim"],"description":"Concurso UFSC","job":"Serviços Gerais"}}' $invocation

curl -i -X POST -H 'Content-Type: application/json' -d '{"func": "RetrieveSelectionProcess", "args": {"id":"1"}}' $invocation

curl -i -X POST -H 'Content-Type: application/json' -d '{"func": "CreateSelectionProcess", "args": {"recruiter":"2", "candidates":["2"],"currStage":"0","stages":["Começo","Termino"],"description":"Concurso UFSC","job":"Aluno"}}' $invocation

curl -i -X POST -H 'Content-Type: application/json' -d '{"func": "RetrieveSelectionProcess", "args": {"id":"2"}}' $invocation

curl -i -X POST -H 'Content-Type: application/json' -d '{"func": "RetrieveAllSelectionProcess", "args": {}}' $invocation

curl -i -X POST -H 'Content-Type: application/json' -d '{"func": "RetrieveCandidateSelectionProcess", "args": {"id":"1"}}' $invocation

curl -i -X POST -H 'Content-Type: application/json' -d '{"func": "RetrieveCandidateSelectionProcess", "args": {"id":"2"}}' $invocation

curl -i -X POST -H 'Content-Type: application/json' -d '{"func": "RetrieveRecruiterSelectionProcess", "args": {"id":"1"}}' $invocation

curl -i -X POST -H 'Content-Type: application/json' -d '{"func": "RetrieveRecruiterSelectionProcess", "args": {"id":"2"}}' $invocation

curl -i -X POST -H 'Content-Type: application/json' -d '{"func": "SelectionProcessSearch", "args": {"words":"Universidade UFSC"}}' $invocation

curl -i -X POST -H 'Content-Type: application/json' -d '{"func": "SelectionProcessSearch", "args": {"words":"Serviços"}}' $invocation