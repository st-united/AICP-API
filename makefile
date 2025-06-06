AICP_API_DEV_REPO:= 902637028063.dkr.ecr.ap-southeast-1.amazonaws.com/aicp-tc-be:0.0.24
PROJECT_ID=enspara
PROJECT_NUMBER=288271283983
REGION=asia-southeast1
ZONE=asia-southeast1-a

REPOSITORY=aicp
IMAGE_NAME=aicp-api
VERSION=0.1.2
ARTIFACT_REGISTRY_NAME=$(REGION)-docker.pkg.dev/$(PROJECT_ID)/$(REPOSITORY)/$(IMAGE_NAME):$(VERSION)


build:
	docker compose up -d --build

up:
	docker compose up -d

up-clean:
	docker compose up -d --build --force-recreate --remove-orphans

stop:
	docker compose stop

down:
	docker compose down

exec:
	docker compose exec backend sh

seed:
	docker compose exec backend npm run seed

build-dist:
	docker compose exec backend npm run build exit

format:
	docker compose exec backend npm run format

login:
	gcloud auth configure-docker $(REGION)-docker.pkg.dev

create:
	gcloud artifacts repositories create $(REPOSITORY) \
			--repository-format=docker \
			--location=$(REGION) \
			--project=$(PROJECT_ID)

build-load:
	docker buildx build \
			--platform linux/arm64 \
			--load \
			-t $(ARTIFACT_REGISTRY_NAME) \
			--no-cache \
			.

build-push:
	docker buildx build \
			--platform linux/amd64 \
			--push \
			-t $(ARTIFACT_REGISTRY_NAME) \
			--no-cache \
			.

run:
	docker run --rm \
			-p 6002:6002 \
			--env-file .env \
			$(ARTIFACT_REGISTRY_NAME)

inspect:
	docker run -it \
			--env-file .env \
			$(ARTIFACT_REGISTRY_NAME) \
			sh

gen-key:
	openssl rand -base64 16

helm-db:
	helm install postgres-aicp oci://registry-1.docker.io/bitnamicharts/postgresql \
		--version 15.3.2 \
		--create-namespace \
		--namespace devplus-aicp \
		-f ./k8s/postgres/values.yaml

helm-redis:
	helm install redis-aicp oci://registry-1.docker.io/bitnamicharts/redis \
		--version 18.6.0 \
		--create-namespace \
		--namespace devplus-aicp \
		-f ./k8s/redis/values.yaml

map-db:
	kubectl -n devplus-aicp port-forward pod/postgres-aicp-postgresql-0 5432:5432

map-redis:
	kubectl -n devplus-aicp port-forward pod/redis-aicp-0 6379:6379

exec-api:
	kubectl exec -it pod/aicp-api-0 -n devplus-aicp -- sh

apply:
	kubectl apply -k ./k8s

get-pods:
	kubectl get all -n devplus-aicp

logs:
	kubectl logs -n devplus-aicp pod/aicp-api-0

restart-api:
	kubectl rollout restart statefulset aicp-api -n devplus-aicp
