dns = require "appload-dns"
zones =
  "appload.pl":
    admin: "rafal@appload.pl"
    records: [
      {class: "A", value: "192.168.1.100"}
      {class: "NS", value: "dns1.appload.pl."}
      {class: "NS", value: "dns2.appload.pl."}
      {prefix: "dns1", value: "192.168.1.100"}
      {prefix: "dns2", value: "192.168.1.101"}
      {prefix: "sample", value: "192.168.1.104"}
      {prefix: "another-sample", value: "192.168.1.105"}
      {class: "MX", value: "10 aspmx.l.google.com."}
      {class: "TXT", value: "hello npm"}
    ]
  "zaqpki.pl":
    admin: "rafal@appload.pl"
    records: [
      {class: "NS", value: "dns1.zaqpki.pl."}
      {class: "NS", value: "dns2.zaqpki.pl."}
      {prefix: "dns1", value: "192.168.1.100"}
      {prefix: "dns2", value: "192.168.1.101"}
      {class: "A", value: "192.168.1.100"}
    ]

server = dns.createServer(zones)
server.listen(53)
