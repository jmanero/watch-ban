Watch Ban
=========

_Watch domain lists to generate DNS black-hole configurations_

## Warning

*This is not a firewall. It is not a network security appliance. It does not provide any functionality to block traffic.* Watch Ban manages DNS policy-zone configurations. It is only effective _if clients use the DNS server_. Users and malicious actors can easily circumvent blocking policies by using another DNS server.

Watch Ban is intended to provide advertisement and domain blocking for well-behaved clients who, essentially, opt into the service.

## Configuration

Take a look at the [example]() directory. It contains an example [configuration](example/config.json) file, and NGiNX and BIND9 configurations. The included [configuration](example/config.json) example should be sufficient to block many advertising, tracking, and compromised e-commerce sites.

_The details of securing and managing NGiNX and BIND9 are out of the scope of this README. Check out the (NGiNX Beginners Guide)[http://nginx.org/en/docs/beginners_guide.html] and the (DigitalOcean BIND9 Tutorial) [https://www.digitalocean.com/community/tutorials/how-to-configure-bind-as-a-private-network-dns-server-on-ubuntu-14-04] for the basics._

* Ensure that the latest version of [NodeJS 4.x](https://nodejs.org/en/download/) is installed.
* Check out or unpack watch-ban into `/opt/watch-ban`.
* Copy the included [Upstart configuration](example/watch-ban.upstart) to `/etc/init/watch-ban.conf`.
* Fire it up `sudo start watch-ban`

#### Notes

* You will need to configure port 80 and 443 listeners/SSL termination as your use-case requires. There is an [NGiNX site configuration](example/nginx/block) included in the example directory.
* You will need to configure the `bind` resource and your BIND9 server to render/load the correct configuration file, and make sure that the correct zone file referenced by the configuration file exists. There is an example [zone file](example/bind/db.null) in the example directory.
