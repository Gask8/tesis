#!/bin/bash
docker build -t my-app .
docker run -d -p 3000:3000 my-app