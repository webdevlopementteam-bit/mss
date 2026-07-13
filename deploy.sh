#!/bin/bash

echo "======================================"
echo "🚀 Starting Deployment..."
echo "======================================"

git pull origin main

#######################################
# FRONTEND
#######################################

echo "📦 Building Frontend..."

cd frontend

npm install

npm run build

rm -rf /home/cybertricksmedia/public_html/mss.cybertricksmedia.in/assets
cp -rf dist/* /home/cybertricksmedia/public_html/mss.cybertricksmedia.in/

#######################################
# ADMIN
#######################################

echo "📦 Building Admin..."

cd ../admin

npm install

npm run build

rm -rf /home/cybertricksmedia/public_html/admin.mss.cybertricksmedia.in/assets
cp -rf dist/* /home/cybertricksmedia/public_html/admin.mss.cybertricksmedia.in/

#######################################
# BACKEND
#######################################

echo "📦 Updating Backend..."

cd ../backend

npm install

pm2 restart mss-api

#######################################
# PERMISSIONS
#######################################

chown -R cybertricksmedia:nobody /home/cybertricksmedia/public_html/mss.cybertricksmedia.in
chown -R cybertricksmedia:nobody /home/cybertricksmedia/public_html/admin.mss.cybertricksmedia.in
chown -R cybertricksmedia:nobody /home/cybertricksmedia/public_html/api.mss.cybertricksmedia.in

echo ""
echo "======================================"
echo "✅ Deployment Completed Successfully"
echo "======================================"
