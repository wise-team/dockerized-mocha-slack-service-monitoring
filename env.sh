#!/usr/bin/env bash
set -e # fail on first error

export NAME="dockerized-mocha-slack-service-monitoring"
export IMAGE_NAME="dms-monitoring"
export SPEC_DIR_IN_CONTAINER="/spec"
export DATA_DIR_IN_CONTAINER="/data"
export APP_DIR_IN_CONTAINER="/app"