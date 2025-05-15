#!/bin/bash
npm run build
pm2 start dist/index.js --name "my-app"
pm2 startup
pm2 save