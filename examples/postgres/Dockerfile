#
# Dockerfile that builds container with Postgres
# When not using vagrant, run it manually with: docker build .
#


# Image: Postgres
#
# VERSION               0.0.1

FROM     ubuntu
MAINTAINER Jonas Colmsjö "jonas@gizur.com"


# sudo will complain about unknown host otherwise
RUN echo "127.0.0.1\t`hostname`" >> /etc/hosts

# make sure the package repository is up to date
RUN echo "deb http://archive.ubuntu.com/ubuntu precise main universe" > /etc/apt/sources.list
RUN apt-get update -y


#
# Install Postgres
#

RUN apt-get install postgresql -y
RUN initdb /usr/local/var/postgres -E utf8


#
# Start Postgres
#

EXPOSE 5432
CMD ["pg_ctl","-D","/usr/local/var/postgres","-l","/usr/local/var/postgres/server.log","start"]
