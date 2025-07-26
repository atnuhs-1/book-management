.PHONY: up down build logs

up:
	docker-compose up -d

down:
	docker-compose down

build:
	docker-compose build

logs:
	docker-compose logs -f

backend:
	docker-compose exec backend bash

frontend:
	docker-compose exec frontend sh