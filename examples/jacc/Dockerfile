#
# Dockerfile that builds container with nodejs and Python
# When not using vagrant, run it manually with: docker build - < Dockerfile.nodejs
#


# Image: NodeJs / hipache / jacc
#
# VERSION               0.0.1


# DOCKER-VERSION 0.3.4
FROM    centos:6.4

# Enable EPEL for Node.js
RUN     rpm -Uvh http://download.fedoraproject.org/pub/epel/6/i386/epel-release-6-8.noarch.rpm


# Install Node.js and npm
RUN wget http://kojipkgs.fedoraproject.org//packages/nodejs-ansi/0.1.2/7.el6.1/noarch/nodejs-ansi-0.1.2-7.el6.1.noarch.rpm
RUN yum --enablerepo="epel" install -y npm ./nodejs-ansi-0.1.2-7.el6.1.noarch.rpm


# Install hipache and redis (used by hipache)
RUN npm install hipache -g
RUN yum install -y redis-server


# Install jacc
RUN npm install jacc -g


# Start a shell that we can attach to
CMD ["/bin/bash"]

