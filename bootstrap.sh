#!/usr/bin/env bash

#
# This script installs the necessary stuff for the docker host.
# Images for the containers are built with Dockerfiles (see at the bottom)
#

sudo apt-get update
sudo apt-get install -y git unzip s3cmd curl


#
# Install docker.io
#

# Kernel upgrade
sudo apt-get install -y linux-image-generic-lts-raring
sudo reboot


sudo apt-get install -y python-software-properties software-properties-common python-pip python-dev libevent-dev
sudo add-apt-repository ppa:dotcloud/lxc-docker
sudo apt-get update
sudo apt-get install -y lxc-docker


#
# Install local docker registry
#

# Currently not used
#echo DOCKER_INDEX_URL="http://0.0.0.0:5000/" >> ~/.profile

#git clone https://github.com/dotcloud/docker-registry.git
#cd docker-registry && cp config_sample.yml config.yml
#pip install -r requirements.txt
#./wsgi.py &
#cd ..


#
# Install NodeJs
#

sudo apt-get update -y
sudo apt-get -y dist-upgrade
sudo apt-get install -y python g++ make software-properties-common
sudo add-apt-repository -y ppa:chris-lea/node.js
sudo apt-get update -y
sudo apt-get install -y nodejs


#
# Install hipache (reverse proxy developed by dotcloud)
#

sudo npm install hipache -g


#
# Install grunt, used for nodejs development
#

sudo npm install grunt grunt-cli -g


#
# Install redis, used by hipache
#

sudo apt-get install -y redis-server


#
# Clone this repo and run the installation
#

cd ~
git clone https://github.com/colmsjo/jacc.git
cd jacc && sudo npm install
