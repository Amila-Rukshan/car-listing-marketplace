#!/bin/bash

# List of ports
ports=("3000" "15000" "15999" "15306" "14000" "14001")

for port in "${ports[@]}"
do
  echo "Killing process on port $port"
  kill -9 $(lsof -i tcp:$port | awk 'NR!=1 {print $2}')
done
