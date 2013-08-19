# Image: Python
#
# VERSION               0.0.1

FROM     ubuntu
MAINTAINER Jonas Colmsjö "jonas@gizur.com"


# -----------------------------------------------------------------------------------
# PREPARATIONS 
#

# sudo will complain about unknown host otherwise
RUN echo "127.0.0.1\t`hostname`" >> /etc/hosts

# make sure the package repository is up to date
RUN echo "deb http://archive.ubuntu.com/ubuntu precise main universe" > /etc/apt/sources.list
RUN apt-get update -y


#
# Install some nice tools
#

RUN apt-get install -y git wget


#
# Install Python and virutalenv
#

RUN apt-get install -y build-essential python2.7-dev python-setuptools
RUN easy_install pip
RUN pip install virtualenv

# Install some dependensices (the OpenERP list)
#RUN apt-get install -y python-dateutil python-feedparser python-ldap python-libxslt1 python-lxml python-mako python-openid python-psycopg2 python-reportlab python-simplejson python-tz python-vobject python-werkzeug python-yaml
#RUN apt-get install -y libldap2-dev libsasl2-dev libpq-dev libxml2-dev libxslt1-dev


# Create Python environment
RUN /usr/local/bin/virtualenv /venv --distribute

# Bundle app source
ADD . /venv/src

# Install OpenERP
RUN /bin/bash -c "source /venv/bin/activate; cd /venv/src; pip install -r requirements.txt"


# Create a user to run as, root is not allowed
#RUN useradd -r -m -s /bin/bash openerp

EXPOSE  5000
#CMD ["/bin/su", "openerp", "-c", "source /venv/bin/activate; /venv/bin/openerp-server"]
CMD ["bin/bash","-c source /venv/bin/activate; /venv/bin/python /venv/src/app.py"]
