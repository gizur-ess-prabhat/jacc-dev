
Installation
------------

Pre-requisite:

 * NodeJs
 * Redis server

Make sure that you are using this DNS server on the clients you want to use this DNS. Check /etc/resolv.conf if you're running on unix. In windows, check the network settings in the control panel.

Install: `npm install --production`


Test the setup
--------------

Start with setting up some hosts with their IP:s in redis (make sure redis is installed an running)

```
redis-cli set redis-dns:redis-dns.local 10.0.0.1
redis-cli set redis-dns:appserver.local 10.0.0.2
```

We can use `dig` for testing purposes. This does not require that we change the DNS of the machine we
are using for the tests since we can use an alternate port in dig.


`dig @localhost -p 5353 redis-dns.local A`
