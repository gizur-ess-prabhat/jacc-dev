all:

doc:
	php ./vendor/bin/sami.php update --force sami-config.php

install:
	curl -sS https://getcomposer.org/installer | php
	mv composer.phar composer
	./composer install

clean:
	rm -rf docs build cache

test:
	./vendor/bin/phpunit tests 

lint:
	./vendor/bin/phpcs --standard=Zend *.php

push:
	tar -cf webapp.tar *
	jacc --cmd push --name=app1.jacc.local --port=8080
