#
# Dockerfile that builds container with nodejs and Python
# When not using vagrant, run it manually with: docker build - < Dockerfile.nodejs
#


# Image: Redis
#
# VERSION               0.0.1

FROM     ubuntu
MAINTAINER Jonas Colmsjö "jonas@gizur.com"


# sudo will complain about unknown host otherwise
RUN echo "127.0.0.1\t`hostname`" >> /etc/hosts
RUN echo "vm.overcommit_memory = 1" >> /etc/sysctl.conf
 
# make sure the package repository is up to date
RUN echo "deb http://archive.ubuntu.com/ubuntu precise main universe" > /etc/apt/sources.list
RUN apt-get update -y

RUN apt-get install redis-server -y

EXPOSE  6379
CMD ["/usr/bin/redis-server"]
