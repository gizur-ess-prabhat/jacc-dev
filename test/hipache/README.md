
## Test hipache from the host

Add a line in `/etc/hosts` for the web site that you use for testing



```
127.0.0.1	www.dotcloud.com
```

Check the IP adress and port:

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


Configure hipache:

```
redis-cli rpush frontend:www.dotcloud.com mywebsite
redis-cli rpush frontend:www.dotcloud.com http://172.16.42.3:8080
```

View the configuration:

```
redis-cli lrange frontend:www.dotcloud.com 0 -1
```

Make sure the destination app works:

```
>http://172.16.42.3:8080
Hello World
```

Try to access the app (hipache is running on port 8080):

```
>curl www.dotcloud.com:8080
```


## Test hipache when outside the host

Coming Soon

