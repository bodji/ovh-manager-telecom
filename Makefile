#### SYSTEM COMMAND ####
NODE=node
NPM=npm
GRUNT=grunt
BOWER=bower
GIT=git
CD=cd
ECHO=@echo
TAR=tar -zcvf
DEL=rm -rf
MAKE=make
MV=mv
RSYNC=rsync -av --delete --exclude=".git"

CERTIFICATE_PASS=manager
CERTIFICATE_INFO='/FR=localhost/O=OVH./C=FR'
CERTIFICATE_KEY=server/certificate/server.key
CERTIFICATE_TMP_KEY=$(CERTIFICATE_KEY).tmp
CERTIFICATE_CSR_FILE=server/certificate/server.csr
CERTIFICATE_CRT_FILE=server/certificate/server.crt

#### FOLDERS ####
BOWER_DIR=client/bower_components
NODE_DIR=node_modules
GRUNT_DEP=$(NODE_DIR)/grunt
DIST_DIR=dist

#### FILES ####
DIST_TAR=dist.tar.gz

#### MACRO ####
NAME=`grep -Po '(?<="name": ")[^"]*' package.json`

#### OTHER ####
ifneq ($(strip $(bower_registry)),)
BOWER_PARAM=--config.registry=$(bower_registry)
endif


help:
	$(ECHO) "_____________________________"
	$(ECHO) "$(NAME)"
	$(ECHO) "Copyright (c) OVH SAS."
	$(ECHO) "All rights reserved."
	$(ECHO) "_____________________________"
	$(ECHO) " -- AVAILABLE TARGETS --"
	$(ECHO) "make clean                                                         => clean the sources"
	$(ECHO) "make gen-certificate                                               => generate certificate"
	$(ECHO) "make install                                                       => install deps"
	$(ECHO) "make dev                                                           => launch the project (development)"
	$(ECHO) "make prod                                                          => launch the project (production) - For testing purpose only"
	$(ECHO) "make test                                                          => launch the tests"
	$(ECHO) "make test-e2e suite=smoke|full browser=phantomjs|chrome|firefox    => launch the e2e tests"
	$(ECHO) "make coverage                                                      => launch the coverage"
	$(ECHO) "make build                                                         => build the project and generate dist"
	$(ECHO) "_____________________________"

clean:
	$(DEL) $(NODE_DIR)
	$(DEL) $(BOWER_DIR)
	$(DEL) $(DIST_DIR)
	$(DEL) $(DIST_TAR)

gen-certificate:
	mkdir -p server/certificate
	openssl genrsa -des3 -passout pass:$(CERTIFICATE_PASS) -out $(CERTIFICATE_KEY) 1024
	openssl req -passin pass:$(CERTIFICATE_PASS) -new -key $(CERTIFICATE_KEY) -out $(CERTIFICATE_CSR_FILE) -subj $(CERTIFICATE_INFO)
	cp $(CERTIFICATE_KEY) $(CERTIFICATE_TMP_KEY)
	openssl rsa -passin pass:$(CERTIFICATE_PASS) -in $(CERTIFICATE_TMP_KEY) -out $(CERTIFICATE_KEY)
	openssl x509 -req -days 365 -in $(CERTIFICATE_CSR_FILE) -signkey $(CERTIFICATE_KEY) -out $(CERTIFICATE_CRT_FILE)
	rm $(CERTIFICATE_TMP_KEY)

install:
	$(NPM) install
	$(BOWER) install $(BOWER_PARAM)

dev: deps
	$(GRUNT) serve

prod: deps
	$(GRUNT) serve:dist

build: deps
	$(GRUNT) build --mode=prod
	$(TAR) $(DIST_TAR) $(DIST_DIR)

release: deps
	$(NPM) version $(type) -m "chore: release v%s"

###############
# Tests tasks #
###############

TEST_REPORTS=test-reports

test: deps
	$(GRUNT) test

coverage: deps
	$(GRUNT) test:coverage:unit

webdriver:
	$(NPM) run update-webdriver

test-e2e: deps webdriver
	$(GRUNT) test:e2e --suite=$(suite) --browser=$(browser); \
	if [ $$? = 0 ]; \
	then \
	$(MAKE) tar-test-reports; \
	exit 0; \
	else \
	$(MAKE) tar-test-reports; \
	exit 2; \
	fi

tar-test-reports:
	$(TAR) $(TEST_REPORTS).tar.gz $(TEST_REPORTS)


#############
# Sub tasks #
#############

# Dependencies of the project
deps: $(GRUNT_DEP) $(BOWER_DIR)

$(BOWER_DIR):
	$(MAKE) install

$(NODE_DIR)/%:
	$(MAKE) install

clean-dist: $(GRUNT_DEP)
	$(GRUNT) clean
