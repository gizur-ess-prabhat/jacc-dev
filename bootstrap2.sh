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
# Script that print IP adress of eth0
#

sudo cp ./ip_addr.sh /usr/local/bin
sudo cp ./etc/bash.bashrc /etc


#
# Nifty tools
#

sudo apt-get install -y git unzip s3cmd curl dkms

# Init vbox guest additions
# NOTE: Should avoid for AWS (need to figure out how)
sudo /etc/init.d/vboxadd setup



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
# Install PHP
#

sudo apt-get install php5-cli php5-curl -y


#
# Install grunt, used for nodejs development
#

sudo npm install grunt grunt-cli -g


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
