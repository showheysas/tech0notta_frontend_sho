#!/bin/sh
cd /home/site/wwwroot

# Use npx to ensure next is found
npx next build && npx next start
