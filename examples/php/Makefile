all:

doc:
	phpdoc -t docs/api -d api/
	./node_modules/doccoh/bin/doccoh -o docs/gizur-admin             applications/gizur-admin/js/*.js

install:
	curl -sS https://getcomposer.org/installer | php
	mv composer.phar composer
	./composer install
	npm install doccoh

clean:
	rm -rf docs build cache

test:
	./vendor/bin/phpunit tests 

lint:
	./vendor/bin/phpcs --standard=Zend api/protected/components/*.php \
					   tests/*.php
