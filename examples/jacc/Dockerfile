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


# Install some tolls
RUN yum install -y git nano


# Install redis
RUN yum install redis -y


# Install hipache and redis (used by hipache)
RUN npm install hipache -g


# Install jacc
RUN npm install jacc -g

# Install ssh daemon
RUN yum install openssh-server -y
RUN mkdir /var/run/sshd
RUN /usr/bin/ssh-keygen -t rsa -N "" -f /etc/ssh/ssh_host_rsa_key
RUN /usr/bin/ssh-keygen -t dsa -N "" -f /etc/ssh/ssh_host_dsa_key

# Set the root password
RUN echo "root:jacc" | chpasswd

# Fix
Add ./etc/pam.d /etc/pam.d


# Add container definitions that are useful in coreos
ADD ./root /root


EXPOSE 22 8080

# Start the ssh daemon
CMD ["/usr/sbin/sshd","-D","-e","-f","/etc/ssh/sshd_config"]

