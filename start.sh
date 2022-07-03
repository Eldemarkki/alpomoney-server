#!/bin/sh

npx prisma migrate deploy
node api.bundle.js