#
# Dockerfile that builds container with Apache and PHP
# When not using vagrant, run it manually with: docker build - < Dockerfile
#


# Image: PHP
#
# VERSION               0.0.1

FROM     ubuntu
MAINTAINER Jonas Colmsjö "jonas@gizur.com"


# -----------------------------------------------------------------------------------
# PREPARATIONS 
#

# sudo will complain about unknown host otherwise
#RUN echo "127.0.0.1\tlocalhost" >> /etc/hosts
#RUN echo "127.0.0.1\t`hostname`" >> /etc/hosts

# make sure the package repository is up to date
#RUN echo "deb http://archive.ubuntu.com/ubuntu precise main universe" > /etc/apt/sources.list
#RUN echo "deb http://archive.ubuntu.com/ubuntu raring main restricted" > /etc/apt/sources.list
#RUN echo "deb http://archive.ubuntu.com/ubuntu raring main universe" > /etc/apt/sources.list
#RUN apt-get update -y


#
# Install some nice tools (mainly used for debugging)
#

RUN apt-get install -y curl lynx git


#
# Install Apache and PHP
#

RUN apt-get install apache2 php5 php5-curl -y


# -----------------------------------------------------------------------------------
# SETUP THE APP
#

# Bundle everything and install in root
ADD . /

RUN chmod a+rx /var
RUN chmod a+rx /var/www
RUN chown -R www-data:www-data /var/www


RUN cd /var/www && curl -sS https://getcomposer.org/installer | php
RUN mv /var/www/composer.phar /var/www/composer
RUN cd /var/www && ./composer install


EXPOSE  80 443
CMD ["/usr/sbin/apache2ctl", "-D", "FOREGROUND"]

