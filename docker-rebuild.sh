#!/bin/bash
docker rmi -f doctor-appointment-server
docker build -t doctor-appointment-server .
docker-compose build
