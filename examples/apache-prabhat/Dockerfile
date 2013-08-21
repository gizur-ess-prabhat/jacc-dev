# Apache2
#
# VERSION               0.0.1

FROM     base
MAINTAINER Prabhat Khera "prabhat.khera@gmail.com"

RUN apt-get -y update

RUN dpkg-divert --local --rename --add /sbin/initctl
RUN ln -s /bin/true /sbin/initctl

RUN apt-get install -y inotify-tools apache2 php5 php5-common php5-mysql php5-curl bzip2 wget vim openssl ssl-cert

env APACHE_RUN_USER www-data
env APACHE_RUN_GROUP www-data
env APACHE_PID_FILE /var/run/apache2.pid
env APACHE_RUN_DIR /var/run/apache2
env APACHE_LOCK_DIR /var/lock/apache2
env APACHE_LOG_DIR /var/log/apache2
env LANG C

RUN a2enmod rewrite

EXPOSE :80

CMD ["/usr/sbin/apache2ctl", "-D",  "FOREGROUND"]
CMD ["apache2", "-D", "FOREGROUND"]
