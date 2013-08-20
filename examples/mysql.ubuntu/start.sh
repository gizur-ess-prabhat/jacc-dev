#!/bin/bash

/usr/bin/mysqld_safe --bind-address=0.0.0.0 &
sleep 10
/usr/bin/mysql < /src/initdb.sql
/usr/bin/tail -f /var/log/mysql.log
