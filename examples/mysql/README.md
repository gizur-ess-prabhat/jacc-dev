You need to allow the root user to login from another host. This is performed by adding
a row to the user table. Doing this requires you to logon (catch 22).

Workaround:

```
# Create a container using the image create with the Dockerfile
docker run -t -i <MYSQL_IMAGE_ID> /bin/bash

# start the MySQL daemon and init table
mysqld_safe &
mysql < /src/initdb.sql

# Disconnect from the container and stop it
ctrl+P ctrl+Q
docker stop <MYSQL_CONTAINER_ID>

# Start the container the ussual way
docker start <MYSQL_IMAGE_ID>
```


Run the test like this: `mysql -h <IP> -u mysql -p < test.sql`
