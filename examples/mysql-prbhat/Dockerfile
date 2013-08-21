# MySQL Server
#
# VERSION               0.0.1

FROM     base
MAINTAINER Prabhat Khera "prabhat.khera@gmail.com"


# Keep upstart from complaining
RUN dpkg-divert --local --rename --add /sbin/initctl
RUN ln -s /bin/true /sbin/initctl

RUN apt-get update

# Install MySQL server
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y mysql-server && apt-get clean && rm -rf /var/lib/apt/lists/*

# Fix configuration
RUN sed -i -e"s/^bind-address\s*=\s*127.0.0.1/bind-address = 0.0.0.0/" /etc/mysql/my.cnf

# Grant priviledges to admin user
# Username: admin
# Password: mysql-server
RUN /usr/sbin/mysqld &
RUN sleep 5
RUN echo "GRANT ALL ON *.* TO admin@'%' IDENTIFIED BY 'mysql-server' WITH GRANT OPTION; FLUSH PRIVILEGES" | mysql


#ADD ./mysql-setup.sh /tmp/mysql-setup.sh
#RUN /bin/sh /tmp/mysql-setup.sh

EXPOSE 3306

CMD ["/usr/sbin/mysqld"]
