# Image: MySQL
#
# VERSION               0.0.1


# DOCKER-VERSION 0.3.4
FROM    ubuntu

# Install MySQL server, used for development
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y mysql-server

RUN /usr/bin/mysql_install_db

# Bundle app source
ADD . /src

ADD ./etc/mysql /etc/mysql

EXPOSE  3306
CMD ["/src/start.sh"]
