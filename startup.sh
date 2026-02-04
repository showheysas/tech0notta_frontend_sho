#!/bin/sh
cd /home/site/wwwroot
npm install --production=false
npm run build
npm start
