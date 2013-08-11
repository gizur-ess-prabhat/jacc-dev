all:

doc:
	cd webapp && php ./vendor/bin/sami.php update --force sami-config.php

install:
	cd var/www && curl -sS https://getcomposer.org/installer | php
	mv var/www/composer.phar var/www/composer
	cd var/www && ./composer install

clean:
	cd var/www && rm -rf docs build cache

test:
	cd var/www && ./vendor/bin/phpunit tests 

lint:
	cd var/www && ./vendor/bin/phpcs --standard=Zend *.php

push:
	if [ -e webapp.tar ]; then rm webapp.tar; fi
	tar -cf webapp.tar *
	jacc --cmd push --name=app1.jacc.local --port=8080
