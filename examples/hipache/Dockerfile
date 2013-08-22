# Image: hipache 
#
# VERSION               0.0.1


# DOCKER-VERSION 0.3.4
FROM    centos:6.4

# Enable EPEL for Node.js
RUN     rpm -Uvh http://download.fedoraproject.org/pub/epel/6/i386/epel-release-6-8.noarch.rpm


# Install Node.js and npm
RUN wget http://kojipkgs.fedoraproject.org//packages/nodejs-ansi/0.1.2/7.el6.1/noarch/nodejs-ansi-0.1.2-7.el6.1.noarch.rpm
RUN yum --enablerepo="epel" install -y npm ./nodejs-ansi-0.1.2-7.el6.1.noarch.rpm


# Install git
RUN yum install -y git


# Install hipache and redis (used by hipache)
RUN npm install hipache -g

ADD ./hipache_config.json ~/

EXPOSE 8080

# Start hipache
CMD ["/usr/bin/hipache","--config","~/hipache_config.json","2>&1"]

