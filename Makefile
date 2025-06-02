env=dev
args=

ifeq ($(env),dev)
compose=compose.dev.yml
else
compose=compose.yml
endif

envfile=--env-file ./.env.${env}

build:
	docker compose ${envfile} -f ${compose} build ${args}

build-no-cache:
	docker compose ${envfile} -f ${compose} build --no-cache ${args}

up:
	docker compose ${envfile} -f ${compose} up -d ${args}

down:
	docker compose ${envfile} -f ${compose} down ${args}

stop:
	docker compose ${envfile} -f ${compose} stop ${args}