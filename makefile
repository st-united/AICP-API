AICP_API_DEV_REPO:= 902637028063.dkr.ecr.ap-southeast-1.amazonaws.com/aicp-tc-be:0.0.24
PROJECT_ID=enspara
PROJECT_NUMBER=288271283983
REGION=asia-southeast1
ZONE=asia-southeast1-a

REPOSITORY=aicp
IMAGE_NAME=aicp-api
VERSION=0.2.15
ARTIFACT_REGISTRY_NAME=$(REGION)-docker.pkg.dev/$(PROJECT_ID)/$(REPOSITORY)/$(IMAGE_NAME):$(VERSION)

DEV_NAMESPACE=devplus-aicp-dev
UAT_NAMESPACE=devplus-aicp-uat
PROD_NAMESPACE=devplus-aicp

POSTGRES_CHART_VERSION=15.3.2
REDIS_CHART_VERSION=18.6.0

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
			--project=$(PROJECT_ID) \

build-load:
	docker buildx build \
					--platform linux/arm64 \
					--load \
					-t $(ARTIFACT_REGISTRY_NAME) \
					--no-cache \
					-f Dockerfile.prod \
					.

build-push:
	docker buildx build \
					--platform linux/amd64 \
					--push \
					-t $(ARTIFACT_REGISTRY_NAME) \
					--no-cache \
					-f Dockerfile.prod \
					.

run:
	docker run --rm \
			-p 6002:6002 \
			--env-file .env.production \
			$(ARTIFACT_REGISTRY_NAME)

inspect:
	docker run -it \
			--env-file .env.production \
			$(ARTIFACT_REGISTRY_NAME) \
			sh

gen-key:
	openssl rand -base64 16

helm-db:
	helm install postgres-aicp oci://registry-1.docker.io/bitnamicharts/postgresql \
			--version 15.3.2 \
			--create-namespace \
			--namespace devplus-aicp \
			--set image.registry=docker.io \
			--set image.repository=bitnamilegacy/postgresql \
			--set image.tag=15.7.0-debian-12-r7 \
			-f ./k8s/postgres/values.yaml

helm-redis:
	helm install redis-aicp oci://registry-1.docker.io/bitnamicharts/redis \
			--version $(REDIS_CHART_VERSION) \
			--namespace devplus-aicp \
			--set image.registry=docker.io \
			--set image.repository=bitnamilegacy/redis \
			--set image.tag=7.0.15-debian-12-r6 \
			--set auth.enabled=false

map-db:
	kubectl -n devplus-aicp port-forward pod/postgres-aicp-postgresql-0 5432:5432

map-redis:
	kubectl -n devplus-aicp port-forward pod/redis-aicp-0 6379:6379

apply:
	kubectl apply -k ./k8s/services

get-pods:
	kubectl get all -n devplus-aicp

logs:
	kubectl logs -n devplus-aicp pod/aicp-api-0

restart-api:
	kubectl rollout restart statefulset aicp-api -n devplus-aicp

manual-db-setup:
	kubectl run aicp-db-setup-manual \
					--image=asia-southeast1-docker.pkg.dev/enspara/aicp/aicp-api:0.2.15 \
					--restart=Never \
					--env-from=secret/aicp-api-env \
					--command -- /bin/sh -c "yarn prisma migrate deploy && yarn db:seed" \
					--namespace=devplus-aicp

# DEV ONLY
reset-db-dev:
	kubectl run aicp-db-reset-manual \
					--image=asia-southeast1-docker.pkg.dev/enspara/aicp/aicp-api:0.2.15 \
					--restart=Never \
					--env-from=secret/aicp-api-env \
					--command -- /bin/sh -c "yarn prisma migrate reset --force && yarn prisma migrate deploy && yarn db:seed" \
					--namespace=devplus-aicp

check-db-status:
	kubectl run aicp-db-status-check \
					--image=asia-southeast1-docker.pkg.dev/enspara/aicp/aicp-api:0.2.15 \
					--restart=Never \
					--env-from=secret/aicp-api-env \
					--command -- /bin/sh -c "yarn prisma migrate status" \
					--namespace=devplus-aicp

prepare-files:
	mkdir -p k8s/services/patches
	mkdir -p k8s/services-dev/patches

# Production deployment
apply-prod:
	kubectl apply -k ./k8s/services

deploy-prod: build-push apply-prod
	kubectl rollout status statefulset aicp-api -n $(PROD_NAMESPACE) --timeout=600s

# UAT deployment
apply-uat:
	kubectl apply -k ./k8s/services-uat

deploy-uat: build-push apply-uat
	kubectl rollout status statefulset aicp-api -n $(UAT_NAMESPACE)

# Development deployment  
apply-dev:
	kubectl apply -k ./k8s/services-dev

deploy-dev: build-push apply-dev
	kubectl rollout status statefulset aicp-api -n $(DEV_NAMESPACE) --timeout=600s

# Environment-specific operations
get-pods-dev:
	kubectl get all -n $(DEV_NAMESPACE)

get-pods-prod:
	kubectl get all -n $(PROD_NAMESPACE)

get-pods-uat:
	kubectl get all -n $(UAT_NAMESPACE)

logs-dev:
	kubectl logs -n $(DEV_NAMESPACE) -l app=aicp-api --tail=100 -f

logs-prod:
	kubectl logs -n $(PROD_NAMESPACE) -l app=aicp-api --tail=100 -f

logs-uat:
	kubectl logs -n $(UAT_NAMESPACE) -l app=aicp-api --

restart-dev:
	kubectl rollout restart statefulset aicp-api -n $(DEV_NAMESPACE)

restart-prod:
	kubectl rollout restart statefulset aicp-api -n $(PROD_NAMESPACE)

restart-uat:
	kubectl rollout restart statefulset aicp-api -n $(UAT_NAMESPACE)

exec-dev:
	kubectl exec -it -n $(DEV_NAMESPACE) aicp-api-0 -- sh

exec-uat:
	kubectl exec -it -n $(UAT_NAMESPACE) aicp-api-0 -- sh

exec-prod:
	kubectl exec -it -n $(PROD_NAMESPACE) aicp-api-0 -- sh

# Database operations
migrate-dev:
	kubectl run aicp-migrate-dev \
			--image=asia-southeast1-docker.pkg.dev/enspara/aicp/aicp-api:$(VERSION) \
			--restart=Never \
			--env-from=secret/aicp-api-env \
			--command -n $(DEV_NAMESPACE) \
			-- /bin/sh -c "yarn prisma migrate deploy && yarn db:seed"

migrate-prod:
	kubectl run aicp-migrate-prod \
			--image=asia-southeast1-docker.pkg.dev/enspara/aicp/aicp-api:$(VERSION) \
			--restart=Never \
			--env-from=secret/aicp-api-env \
			--command -n $(PROD_NAMESPACE) \
			-- /bin/sh -c "yarn prisma migrate deploy"

migrate-uat:
	kubectl run aicp-migrate-uat \
			--image=asia-southeast1-docker.pkg.dev/enspara/aicp/aicp-api:$(VERSION) \
			--restart=Never \
			--env-from=secret/aicp-api-env \
			--command -n $(UAT_NAMESPACE) \
			-- /bin/sh -c "yarn prisma migrate deploy && yarn db:seed

# Complete setup
setup-complete-dev: helm-db helm-redis deploy-dev
setup-complete-prod: helm-db helm-redis deploy-prod

# Cleanup
cleanup-dev:
	kubectl delete namespace $(DEV_NAMESPACE) --ignore-not-found

cleanup-prod:
	kubectl delete namespace $(PROD_NAMESPACE) --ignore-not-found

cleanup-uat:
	kubectl delete namespace $(UAT_NAMESPACE) --ignore-not-found

# Install PostgreSQL for Production
helm-postgres-prod:
	helm repo add bitnami https://charts.bitnami.com/bitnami
	helm repo update
	helm upgrade --install postgres-aicp oci://registry-1.docker.io/bitnamicharts/postgresql \
            --version $(POSTGRES_CHART_VERSION) \
            --namespace $(PROD_NAMESPACE) \
            --create-namespace \
            --set image.registry=docker.io \
            --set image.repository=bitnamilegacy/postgresql \
            --set image.tag=16.3.0-debian-12-r6 \
            --set auth.existingSecret=aicp-api-env \
            --set auth.secretKeys.adminPasswordKey=POSTGRES_PASSWORD \
            --set auth.secretKeys.userPasswordKey=POSTGRES_PASSWORD \
            --values ./k8s/postgres/values.yaml \
            --wait --timeout=600s

# Install Redis for Production
helm-redis-prod:
	helm repo add bitnami https://charts.bitnami.com/bitnami
	helm repo update
	helm upgrade --install redis-aicp oci://registry-1.docker.io/bitnamicharts/redis \
            --version $(REDIS_CHART_VERSION) \
            --namespace $(PROD_NAMESPACE) \
            --create-namespace \
            --set image.registry=docker.io \
            --set image.repository=bitnamilegacy/redis \
            --set image.tag=7.2.3-debian-11-r1 \
            --set auth.existingSecret=aicp-api-env \
            --set auth.existingSecretPasswordKey=REDIS_PASSWORD \
            --values ./k8s/redis/values.yaml \
            --wait --timeout=600s

# Install PostgreSQL for UAT
helm-postgres-uat:
	helm repo add bitnami https://charts.bitnami.com/bitnami
	helm repo update
	helm upgrade --install postgres-aicp oci://registry-1.docker.io/bitnamicharts/postgresql \
            --version $(POSTGRES_CHART_VERSION) \
            --namespace $(UAT_NAMESPACE) \
            --create-namespace \
            --set image.registry=docker.io \
            --set image.repository=bitnamilegacy/postgresql \
            --set image.tag=16.3.0-debian-12-r6 \
            --set auth.existingSecret=aicp-api-env \
            --set auth.secretKeys.adminPasswordKey=POSTGRES_PASSWORD \
            --set auth.secretKeys.userPasswordKey=POSTGRES_PASSWORD \
            --values ./k8s/postgres/values-uat.yaml \
            --wait --timeout=600s

# Install Redis for UAT
helm-redis-uat:
	helm repo add bitnami https://charts.bitnami.com/bitnami
	helm repo update
	helm upgrade --install redis-aicp oci://registry-1.docker.io/bitnamicharts/redis \
            --version $(REDIS_CHART_VERSION) \
            --namespace $(UAT_NAMESPACE) \
            --create-namespace \
            --set image.registry=docker.io \
            --set image.repository=bitnamilegacy/redis \
            --set image.tag=7.2.3-debian-11-r1 \
            --set auth.existingSecret=aicp-api-env \
            --set auth.existingSecretPasswordKey=REDIS_PASSWORD \
            --values ./k8s/redis/values-uat.yaml \
            --wait --timeout=600s

# Install PostgreSQL for Development
helm-postgres-dev:
	helm repo add bitnami https://charts.bitnami.com/bitnami
	helm repo update
	helm upgrade --install postgres-aicp oci://registry-1.docker.io/bitnamicharts/postgresql \
            --version $(POSTGRES_CHART_VERSION) \
            --namespace $(DEV_NAMESPACE) \
            --create-namespace \
            --set image.registry=docker.io \
            --set image.repository=bitnamilegacy/postgresql \
            --set image.tag=16.3.0-debian-12-r6 \
            --set auth.existingSecret=aicp-api-env \
            --set auth.secretKeys.adminPasswordKey=POSTGRES_PASSWORD \
            --set auth.secretKeys.userPasswordKey=POSTGRES_PASSWORD \
            --values ./k8s/postgres/values-dev.yaml \
            --wait --timeout=600s

# Install Redis for Development
helm-redis-dev:
	helm repo add bitnami https://charts.bitnami.com/bitnami
	helm repo update
	helm upgrade --install redis-aicp oci://registry-1.docker.io/bitnamicharts/redis \
            --version $(REDIS_CHART_VERSION) \
            --namespace $(DEV_NAMESPACE) \
            --create-namespace \
            --set image.registry=docker.io \
            --set image.repository=bitnamilegacy/redis \
            --set image.tag=7.2.3-debian-11-r1 \
            --set auth.existingSecret=aicp-api-env \
            --set auth.existingSecretPasswordKey=REDIS_PASSWORD \
            --values ./k8s/redis/values-dev.yaml \
            --wait --timeout=600s

# Install both for Production
helm-infra-prod: helm-postgres-prod helm-redis-prod
	@echo "✅ Production infrastructure installed"

# Install both for Development  
helm-infra-dev: helm-postgres-dev helm-redis-dev
	@echo "✅ Development infrastructure installed"

# Install both for UAT
helm-infra-uat: helm-postgres-uat helm-redis-uat
	@echo "✅ UAT infrastructure installed"

# # Complete setup commands
setup-complete-dev: helm-infra-dev deploy-dev
	@echo "✅ Development environment ready!"

setup-complete-prod: helm-infra-prod deploy-prod
	@echo "✅ Production environment ready!"

# Database connection helpers
connect-postgres-dev:
	kubectl port-forward -n $(DEV_NAMESPACE) svc/postgres-aicp-postgresql 5432:5432

connect-postgres-prod:
	kubectl port-forward -n $(PROD_NAMESPACE) svc/postgres-aicp-postgresql 5432:5432

connect-postgres-uat:
	kubectl port-forward -n $(UAT_NAMESPACE) svc/postgres-aicp-postgresql 5432:5432

connect-redis-uat:
	kubectl port-forward -n $(UAT_NAMESPACE) svc/redis-aicp 6379:6379

connect-redis-dev:
	kubectl port-forward -n $(DEV_NAMESPACE) svc/redis-aicp 6379:6379

connect-redis-prod:
	kubectl port-forward -n $(PROD_NAMESPACE) svc/redis-aicp 6379:6379

# Get passwords
get-postgres-password-dev:
	kubectl get secret -n $(DEV_NAMESPACE) postgres-aicp-postgresql -o jsonpath="{.data.postgres-password}" | base64 -d

get-postgres-password-prod:
	kubectl get secret -n $(PROD_NAMESPACE) postgres-aicp-postgresql -o jsonpath="{.data.postgres-password}" | base64 -d

get-redis-password-dev:
	kubectl get secret -n $(DEV_NAMESPACE) redis-aicp -o jsonpath="{.data.redis-password}" | base64 -d

get-redis-password-prod:
	kubectl get secret -n $(PROD_NAMESPACE) redis-aicp -o jsonpath="{.data.redis-password}" | base64 -d

# Upgrade charts
upgrade-postgres-dev:
	helm upgrade postgres-aicp oci://registry-1.docker.io/bitnamicharts/postgresql \
			--version $(POSTGRES_CHART_VERSION) \
			--namespace $(DEV_NAMESPACE) \
			--values ./k8s/postgres/values-dev.yaml

upgrade-postgres-uat:
	helm upgrade postgres-aicp oci://registry-1.docker.io/bitnamicharts/postgresql \
			--version $(POSTGRES_CHART_VERSION) \
			--namespace $(UAT_NAMESPACE) \
			--values ./k8s/postgres/values-uat.yaml

upgrade-postgres-prod:
	helm upgrade postgres-aicp oci://registry-1.docker.io/bitnamicharts/postgresql \
    --version 15.3.2 \
    --namespace devplus-aicp \
    --set image.registry=docker.io \
    --set image.repository=bitnamilegacy/postgresql \
    --set image.tag=16.3.0-debian-12-r6 \
    -f ./k8s/postgres/values.yaml

upgrade-redis-dev:
	helm upgrade redis-aicp oci://registry-1.docker.io/bitnamicharts/redis \
			--version $(REDIS_CHART_VERSION) \
			--namespace $(DEV_NAMESPACE) \
			--values ./k8s/redis/values-dev.yaml

upgrade-redis-uat:
	helm upgrade redis-aicp oci://registry-1.docker.io/bitnamicharts/redis \
			--version $(REDIS_CHART_VERSION) \
			--namespace $(UAT_NAMESPACE) \
			--values ./k8s/redis/values-uat.yaml

upgrade-redis-prod:
	helm upgrade redis-aicp oci://registry-1.docker.io/bitnamicharts/redis \
					--version $(REDIS_CHART_VERSION) \
					--namespace $(PROD_NAMESPACE) \
					--set image.registry=docker.io \
					--set image.repository=bitnamilegacy/redis \
					--set image.tag=7.2.3-debian-11-r1 \
					--values ./k8s/redis/values.yaml

# Cleanup infrastructure
cleanup-infra-dev:
	helm uninstall postgres-aicp -n $(DEV_NAMESPACE) || true
	helm uninstall redis-aicp -n $(DEV_NAMESPACE) || true

cleanup-infra-uat:
	helm uninstall postgres-aicp -n $(UAT_NAMESPACE) || true
	helm uninstall redis-aicp -n $(UAT_NAMESPACE) || true

cleanup-infra-prod:
	helm uninstall postgres-aicp -n $(PROD_NAMESPACE) || true
	helm uninstall redis-aicp -n $(PROD_NAMESPACE) || true

# Health checks
check-postgres-dev:
	kubectl exec -it -n $(DEV_NAMESPACE) postgres-aicp-postgresql-0 -- psql -U aicp_dev_user -d aicp_dev -c "SELECT version();"

check-postgres-prod:
	kubectl exec -it -n $(PROD_NAMESPACE) postgres-aicp-postgresql-0 -- psql -U aicp_user -d aicp_prod -c "SELECT version();"

check-redis-dev:
	kubectl exec -it -n $(DEV_NAMESPACE) redis-aicp-0 -- redis-cli -a $(shell make get-redis-password-dev) ping

check-redis-prod:
	kubectl exec -it -n $(PROD_NAMESPACE) redis-aicp-0 -- redis-cli -a $(shell make get-redis-password-prod) ping