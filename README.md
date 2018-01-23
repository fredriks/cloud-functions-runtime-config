# Cloud Functions Runtime Config

This is a wrapper around Google API Client to read Runtime Config variables in Cloud Functions.

**Note: Runtime Config is currently in beta so things might break!**

## Installation
```shell
npm install --save cloud-functions-runtime-config
```

## Usage
```javascript
const runtimeConfig = require('cloud-functions-runtime-config');
const lunchPlans = runtimeConfig.getVariable('dev-config', 'lunch-plans');

exports.lunchPlanner = (req, res) => {
    return lunchPlans
        .then((val) => {
            console.log(val);
            res.status(200).send(val);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send(err);
        });
};
```

## Basic example

#### Enable the RuntimeConfig API

Either using the [API Manager](https://console.cloud.google.com/apis/api/runtimeconfig.googleapis.com/overview) in Cloud Console or using gcloud:
```shell
gcloud service-management enable runtimeconfig.googleapis.com
```

#### Config setup

Create a config resource and store a variable in it.
```shell
gcloud beta runtime-config configs create dev-config
gcloud beta runtime-config configs variables \
    set lunch-plans "lets go for a hamburger!" \
    --config-name dev-config
```

#### Cloud Function

A basic HTTP Function that returns the variable value.
```javascript
const runtimeConfig = require('cloud-functions-runtime-config');
const lunchPlans = runtimeConfig.getVariable('dev-config', 'lunch-plans');

exports.lunchPlanner = (req, res) => {
    return lunchPlans
        .then((val) => res.status(200).send(val))
        .catch((err) => res.status(500).send(err));
};
```

Deploying the Function with an HTTP trigger:
```shell
gcloud beta functions deploy lunchPlanner \
    --trigger-http \
    --stage-bucket=<YOUR-BUCKET>
```

Test the Function:
```shell
curl https://us-central1-$(gcloud config get-value core/project).cloudfunctions.net/lunchPlanner
```

#### Cleanup
```shell
gcloud beta runtime-config configs delete dev-config
gcloud beta functions delete lunchPlanner
```

## API

### runtimeConfig.getVariable(config, variable)

Returns a `Promise` that is either resolved to the value read from Runtime Config or rejected if the variable could not be read.

##### config

Type: `string`

##### variable

Type: `string`

### runtimeConfig.getVariables(config, variables)

Returns a `Promise` that is either resolved to an `Array` of values or rejected if _any_ of the variables could not be read.
The values are returned in the same order as the variableNames.

##### config

Type: `string`

##### variables

Type: `Array<string>`

## License
[The MIT License (MIT)](/LICENSE)
