all:

push:
	if [ -e webapp.tar ]; then rm webapp.tar; fi
	tar -cf webapp.tar *
	jacc --cmd push --name=app1.jacc.local --port=8080
