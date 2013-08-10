all:

doc:
	cd webapp && php ./vendor/bin/sami.php update --force sami-config.php

install:
	cd webapp
	curl -sS https://getcomposer.org/installer | php
	mv composer.phar composer
	./composer install

clean:
	cd webapp
	rm -rf docs build cache

test:
	cd webapp
	./vendor/bin/phpunit tests 

lint:
	cd webapp
	./vendor/bin/phpcs --standard=Zend *.php

push:
	tar -cf webapp.tar webapp/*
	jacc --cmd push --name=app1.jacc.local --port=8080
