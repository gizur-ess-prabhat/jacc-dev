Configuration applied after  the installation
---------------------------------------------

These settings are probably not appropriate for production.


/etc/postgresql/9.1/main/postgresql.conf:

```
listen_addresses = '*'

```


/etc/postgresql/9.1/main/pg_hba.conf:

```
# "local" is for Unix domain socket connections only
local   all             all                                     trust

# IPv4 local connections:
host    all             all             127.0.0.1/32            trust 

# IPv6 local connections:
host    all             all             ::1/128                 trust
```
