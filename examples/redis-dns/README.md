
Installation
------------

Pre-requisite:

 * NodeJs
 * Redis server

Make sure that you are using this DNS server on the clients you want to use this DNS. Check /etc/resolv.conf if you're running on unix. In windows, check the network settings in the control panel.

Install: `npm install --production`

Copy `redis-dns.json.template` to `redis-dns.json` and update with your settings.


Test the setup
--------------

A good way of testing redis-dns is to run it within a docker container.

```
docker build .
...
Successfully built 0e58a485fe88
docker run 0e58a485fe88
```

Check the port that's been mapped for the container just created. In this case was 5353 mapped towards 49163:

```
docker ps
ID                  IMAGE               COMMAND                CREATED              STATUS              PORTS
a40a9b6e3160        e756f9bcf819        node /src/server.js    47 seconds ago       Up 46 seconds       49163->5353    
```

Start with setting up some hosts with their IP:s in redis (make sure redis is installed an running)

```
redis-cli set redis-dns:dbserver.redis-dns.local 10.0.0.1
redis-cli set redis-dns:appserver.redis-dns.local 10.0.0.2
```

We can use `dig` for testing purposes. This does not require that we change the DNS of the machine we
are using for the tests since we can use an alternate port in dig.

The port 5353 has in the container has been mapped towards 49163 on localhost in this example: 
`dig @localhost -p 49163 redis-dns.local A`



