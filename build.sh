#!/usr/bin/env bash
set -e # fail on first error
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "${DIR}"

source "${DIR}/env.sh"

docker build --no-cache -t ${IMAGE_NAME} .