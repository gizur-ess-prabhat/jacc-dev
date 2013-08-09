#!/usr/bin/env bash

#
# This script installs the necessary stuff for the docker host.
# Images for the containers are built with Dockerfiles (see at the bottom)
#

sudo apt-get update

#
# Install docker.io
#

sudo apt-get install -y python-software-properties software-properties-common python-pip python-dev libevent-dev
sudo add-apt-repository ppa:dotcloud/lxc-docker
sudo apt-get update
sudo apt-get install -y lxc-docker


#
# Nifty tools
#

sudo apt-get install -y git unzip s3cmd curl


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
sudo apt-get install -y python g++ make software-properties-common
sudo add-apt-repository -y ppa:chris-lea/node.js
sudo apt-get update -y
sudo apt-get install -y nodejs


#
# Install CoffeeScript
#

sudo apt-get install -y coffeescript


#
# Install hipache (reverse proxy developed by dotcloud)
#

sudo npm install hipache -g


#
# Install grunt, used for nodejs development
#

sudo npm install grunt grunt-cli -g


#
# Local name server, used for development and testing purposes
#

sudo npm install -g appload-dns

# Use the local nameserver and then google's
sudo sh -c 'echo "dns-nameservers localhost 8.8.8.8" >> /etc/network/interfaces'


#
# Install redis, used by hipache
#

sudo apt-get install -y redis-server


#
# Clone this repo and run the installation
#

cd ~
git clone https://github.com/colmsjo/jacc.git
cd jacc && sudo npm install --production -g
