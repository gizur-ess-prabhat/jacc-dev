# Image: MySQL
#
# VERSION               0.0.1


# DOCKER-VERSION 0.3.4
FROM    centos:6.4

# Enable EPEL
#RUN     rpm -Uvh http://download.fedoraproject.org/pub/epel/6/i386/epel-release-6-8.noarch.rpm

# Install MySQL server, used for development
RUN yum install -y mysql-server

RUN /usr/bin/mysql_install_db

# Bundle app source
ADD . /src


EXPOSE  3306
#CMD ["/usr/sbin/mysqld_safe","--no-defaults"]
CMD ["/usr/libexec/mysqld","--basedir=/usr","--datadir=/var/lib/mysql","--user=mysql","--log-error=/var/log/mysqld.log","--pid-file=/var/run/mysqld/mysqld.pid", "--socket=/var/lib/mysql/mysql.sock"]
