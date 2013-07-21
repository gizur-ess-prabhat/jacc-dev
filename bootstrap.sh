#!/usr/bin/env bash

#
# This script installs the necessary stuff for the docker host.
# Images for the containers are built with Dockerfiles (see at the bottom)
#

sudo apt-get update

#
# Kernel upgrade
#

sudo apt-get install -y linux-image-generic-lts-raring
#sudo reboot
#echo "Sleep for 10 seconds while rebooting..."
#sleep 10
