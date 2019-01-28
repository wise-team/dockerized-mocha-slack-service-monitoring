#!/usr/bin/env bash
set -e # fail on first error
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "${DIR}"

source "${DIR}/env.sh"

##

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

if [ -z "${FAILURE_NOTIFICATION_INTERVAL_S}" ]; then
    echo "${NAME}: FAILURE_NOTIFICATION_INTERVAL_S env is not set"
    exit 1
fi

##

if [ ! -d "${SPEC_DIR_IN_CONTAINER}" ]; then
    echo "${NAME}: ${SPEC_DIR_IN_CONTAINER} volume does not exists"
    exit 1
fi

if [ ! -d "${DATA_DIR_IN_CONTAINER}" ]; then
    echo "${NAME}: ${DATA_DIR_IN_CONTAINER} volume does not exists"
    exit 1
fi

##

cd ${SPEC_DIR_IN_CONTAINER} && npm install > /dev/null


cd ${APP_DIR_IN_CONTAINER} && npm run --silent monitor
