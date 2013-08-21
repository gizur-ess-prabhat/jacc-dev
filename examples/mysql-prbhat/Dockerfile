# MySQL Server
#
# VERSION               0.0.1

FROM     base
MAINTAINER Prabhat Khera "prabhat.khera@gmail.com"

# Username: admin
# Password: mysql-server
ADD ./mysql-setup.sh /tmp/mysql-setup.sh
RUN /bin/sh /tmp/mysql-setup.sh

EXPOSE 3306

CMD ["/usr/sbin/mysqld"]
