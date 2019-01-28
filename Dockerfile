#§ 'FROM node:' + data.config.npm.node.version + '-slim'
FROM node:10.15-slim

WORKDIR /app
ADD . /app

RUN bash -c 'set -o pipefail && \
    ( \
    if [[ "$(node --version)" = "$(cat .nvmrc)"* ]]; then \
    echo "Node version correct"; else echo "Node version in .nvmrc is different. Please update Dockerfile" && exit 1; fi \
    ) \
    && npm install \
    && npm run build'

CMD ["/app/entrypoint.sh"]


##§ '\n' + data.config.docker.generateDockerfileFrontMatter(data) + '\n' §##
LABEL maintainer="The Wise Team (https://wise-team.io/) <contact@wiseteam.io>"
LABEL vote.wise.wise-version="3.1.1"
LABEL vote.wise.license="MIT"
LABEL vote.wise.repository="dockerized-mocha-slack-service-monitoring"
##§ §.##