
Installation
------------

Pre-requisite:

 * NodeJs
 * Redis server

Make sure that you are using this DNS server on the clients you want to use this DNS. Check /etc/resolv.conf if you're running on unix. In windows, check the network settings in the control panel.

Install: `npm install --production`


Test the setup
--------------

A good way of testing redis-dns is to run it within a docker container.

```
docker build .
...
Successfully built 0e58a485fe88
docker run 0e58a485fe88
```

Then start another terminal and start a new container: `docker run -t -i -dns=[] CONTAINER_ID ubuntu /bin/bash`

Start with setting up some hosts with their IP:s in redis (make sure redis is installed an running)

```
redis-cli set redis-dns:redis-dns.local 10.0.0.1
redis-cli set redis-dns:appserver.local 10.0.0.2
```

We can use `dig` for testing purposes. This does not require that we change the DNS of the machine we
are using for the tests since we can use an alternate port in dig.


`dig @IP_OF_DNS_CONTAINER -p 5353 redis-dns.local A`
