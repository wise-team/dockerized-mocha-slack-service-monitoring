# dockerized-mocha-slack-service-monitoring

Simple service monitoring tool that runs mocha tests and reports to slack. Run with docker-container

### Running

```bash

$ docker run --rm \
    --name "hub-production-monitoring" \
    -e "SLACK_WEBHOOK_URL=https://hooks.slack.com/services/..." \
    -e "ENVIRONMENT_TYPE=production" \
    -e "SLACK_MENTIONS=" \
    -e "PROJECT_NAME=wise-hub" \
    -e "FAILURE_NOTIFICATION_INTERVAL_S=1800" \
    -e "ENV_FOR_SPECIFIC_TEST=(...)" \
    -v "/path/to/tests/dir:/spec" \
    -v "hub-production-monitoring-datavolume:/data" \
    wise-team/dockerized-mocha-slack-service-monitoring
```
