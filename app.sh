#!/bin/bash

if [[ "$1" = 'up' ]]; then
	cd ./minifabric

	cp ../main.js ./vars/app/node/main.js

	./minifab apprun -l node &

	cd ..

	while : ; do
		sleep 7
		doneup=$(docker inspect -f {{.State.Running}} apprun)
		if [[ "$doneup" = 'true' ]]; then
			break
		fi
	done

	address=$(docker inspect apprun | grep '                "IPAddress"')
	address=${address/'                "IPAddress": "'}
	address=${address/'",'}

	echo "Server running at $address:8081"
	echo 'To stop the app, run "./app.sh down"'
elif [[ "$1" = 'down' ]]; then
	docker container stop apprun
else
	echo "Unkown option"
fi
