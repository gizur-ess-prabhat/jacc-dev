## Test hipache


### Preparations

Start hipache:

```
../../bin/start-hipache
cat ../../var/log/hipache.log 
```


Add a line in `/etc/hosts` for the web site that you use for testing


```
127.0.0.1	www.dotcloud.com
```

Start a app (../webapp for instance) and check the IP adress and port:

```
>docker ps
ID                  IMAGE               COMMAND              CREATED             STATUS              PORTS
925ad6c689bf        3e5e2f3f84a3        node /src/index.js   6 hours ago         Up 6 hours          49153->8080         

>docker inspect 925ad6c689bf
...
    "NetworkSettings": {
        "IPAddress": "172.16.42.3",
...
```


### Configure hipache

Remove old configuration:``redis-cli del frontend:www.dotcloud.com`

Add the new configuration:

```
redis-cli rpush frontend:www.dotcloud.com mywebsite
redis-cli rpush frontend:www.dotcloud.com http://172.16.42.3:8080
```

View the configuration: `redis-cli lrange frontend:www.dotcloud.com 0 -1`


### Test

Make sure the destination app works:

```
>http://172.16.42.3:8080
Hello World
```

Try to access the app (hipache is running on port 8080): `>curl http://www.dotcloud.com:8080`

Check the hipache access log: `cat ../../var/log/hipache_access.log`

Now test hipache when outside the host (this vagrant configuration maps port 8080 toward 8080 in
the guest): `>curl http://www.dotcloud.com:8080`

Check the hipache access log again: `cat ../../var/log/hipache_access.log`

