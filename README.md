hipache configuration
--------------------

hipache is configured through a redis database.

First make sure that redis is running (assuming it already is installed):
`sudo service redis-server status`

Test to set and get some keys in redis using node: `node app.js`

You should see something like this:

```
Reply: OK
Reply: some fantastic value
Reply: 0
Reply: 1
Reply: 2
Reply: mywebsite,http://192.168.0.42:8080
Reply: 1
```


