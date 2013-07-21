Jacc - Just Another Cloud in the Cloud
======================================

Lighweight linux containers are used to build a private cloud. Booting a new container is easy
and is done in a few seconds. Create a tar archive named webapp.tar containing the code and a
Dockerfile in the root and then run `/path_to_jacc/jacc --cmd push`.


Installation
------------

Pre-requisites:

 * Virtualbox to run locally
 * AWS account to launch a server in Amazons cloud 

The repo comes with a Vagrantfile. Installation of a test/development environment is done running
`vagrant up vb`. Then reboot the machine with `vagrant halt vb` followed by ``vagrant up vb`. 
Rebooting is needed since a kernel upgrade is performed.

It should also be possible to run `bootstrap.sh` followed by ``bootstrap2.sh` in any Ubuntu machine.


## AWS EC2

You could just launch a 64-bit precise server, clone this repo and then run `bootstrap.sh`.

Using vagrant, do:

```
# Install AWS plusin
vagrant plugin install vagrant-aws
vagrant plugin list

# A dummy box is needed
vagrant box add dummy https://github.com/mitchellh/vagrant-aws/raw/master/dummy.box

# Set this variable to use AWS, it should bot be set to use a local Virtualbox instead
export VAGRANT_AWS='Yes'

# These environment variables need to be set, put in bashrc/bach_profile env 
# NOTE: Only the region us-east-1 seams to work at the moment.
export AWS_API_KEY=...
export AWS_API_SECRET=...
export AWS_PRIVATE_KEY_PATH=...
export AWS_KEYAIR_NAME=...
export AWS_REGION=...

vagrant up aws
```


Troubleshooting
---------------

hipache is configured through a redis database. Make sure that redis is running (assuming 
it already is installed): `sudo service redis-server status`

When using vagrant, run the bootstrap.sh script manually after the machine has been created.
The kernel upgrade stops the execution of the script so the rest need to be executed once
more.

