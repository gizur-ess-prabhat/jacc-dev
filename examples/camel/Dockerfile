# Image: Camel (based on Java)
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
# Install some nice tools
#

RUN apt-get install -y git wget curl


#
# Install Java
#

RUN apt-get install -y java-common openjdk-6-jdk maven2


#
# Install Camel
#

RUN curl -sS http://apache.mirrors.spacedump.net/camel/apache-camel/2.11.1/apache-camel-2.11.1.tar.gz | tar xzv


# Bundle app source
ADD . /src


# Install app dependencies
RUN cd /src; mvn package


EXPOSE  5000
CMD ["java", "-cp","/src/target/classes:/src/target/dependency/*","-DPORT=5000", "HelloWorld"]

# Equivalent to doing this: java -cp /src/target/classes:/src/target/dependency/* -DPORT=5000 HelloWorld
