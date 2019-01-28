#!/usr/bin/env bash
set -e # fail on first error
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "${DIR}"

NAME="dockerized-mocha-slack-service-monitoring"

if [ -z "${SLACK_WEBHOOK_URL}" ]; then
    echo "${NAME}: SLACK_WEBHOOK_URL env is not set"
    exit 1
fi

if [ -z "${ENVIRONMENT_TYPE}" ]; then
    echo "${NAME}: ENVIRONMENT_TYPE env is not set"
    exit 1
fi

if [ -z "${PROJECT_NAME}" ]; then
    echo "${NAME}: PROJECT_NAME env is not set"
    exit 1
fi

if [ -z "${SPEC_TESTS_DIR}" ]; then
    echo "${NAME}: SPEC_TESTS_DIR env is not set"
    exit 1
fi

if [ -z "${FAILURE_NOTIFICATION_INTERVAL_S}" ]; then
    echo "${NAME}: FAILURE_NOTIFICATION_INTERVAL_S env is not set"
    exit 1
fi

NODE_VERSION="10.15"
DATA_VOLUME="monitoring_${PROJECT_NAME}_data"
CONTAINER_NAME="monitoring-${PROJECT_NAME}"
IMAGE="node:${NODE_VERSION}-slim"


docker run --rm\
  --name "${CONTAINER_NAME}" \
  -v "${PWD}:/app" \
  -w /app \
  -e "SLACK_WEBHOOK_URL=${SLACK_WEBHOOK_URL}" \
  -e "ENVIRONMENT_TYPE=${ENVIRONMENT_TYPE}" \
  -e "SLACK_MENTIONS=${SLACK_MENTIONS}" \
  -e "PROJECT_NAME=${PROJECT_NAME}" \
  -e "FAILURE_NOTIFICATION_INTERVAL_S=${FAILURE_NOTIFICATION_INTERVAL_S}" \
  -v "${SPEC_TESTS_DIR}:/spec:ro" \
  -v "${DATA_VOLUME}:/data" \
  "${IMAGE}" sh -c "npm install > /dev/null && npm run --silent monitor"
