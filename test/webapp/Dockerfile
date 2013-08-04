#
# Dockerfile that builds container with nodejs and Python
# When not using vagrant, run it manually with: docker build - < Dockerfile.nodejs
#


# Image: NodeJS & Python
#
# VERSION               0.0.1


# DOCKER-VERSION 0.3.4
FROM    centos:6.4

# Enable EPEL for Node.js
#RUN     rpm -Uvh http://download.fedoraproject.org/pub/epel/6/i386/epel-release-6-8.noarch.rpm
ADD epel-release-6-8.noarch.rpm /
RUN     rpm -Uvh /epel-release-6-8.noarch.rpm

# Install Node.js and npm
RUN     yum install -y npm-1.2.17-5.el6

# Bundle app source
ADD . /src

# Install app dependencies
RUN cd /src; npm install

EXPOSE  8080
CMD ["node", "/src/index.js"]

