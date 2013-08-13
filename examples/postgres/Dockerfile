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

# Check status of the database
RUN /etc/init.d/postgresql status
#RUN /etc/init.d/postgresql start


# Create postgres user for OpenERP
RUN su postgres -c "createuser --createdb --username postgres --no-createrole -s openerp"

# Set password to 'postgres' for openerp user
RUN su postgres -c "echo alter role openerp with password \'postgres\'\; |psql template1"

# Show the users installed (just for debugging)
RUN su postgres -c 'echo "SELECT rolname FROM pg_roles;\q"|psql'

#
# Add configuration changes
#

ADD ./etc/postgresql/9.1/main /etc/postgresql/9.1/main


#
# Start Postgres
#

EXPOSE 5432

CMD ["/usr/lib/postgresql/9.1/bin/postgres","-D","/var/lib/postgresql/9.1/main","-c","config_file=/etc/postgresql/9.1/main/postgresql.conf"]
