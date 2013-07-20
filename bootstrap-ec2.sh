#!/usr/bin/env bash

#
# Setup docker.io inside an AWS EC2 machine 
#

# The linux-image-extra package is only needed on standard Ubuntu EC2 AMIs in order to install the aufs kernel module. 
sudo apt-get install linux-image-extra-`uname -r`


#
# Upgrade the kernel
#

#sudo apt-get install -y linux-image-generic-lts-raring
sudo apt-get upgrade -y
sudo reboot


#
# The rest is the same as outside ec2
#

source ./bootstrap.sh

