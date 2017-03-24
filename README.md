# Cloud Functions Runtime Config

This is a wrapper around Google API Client to read Runtime Config variables in Cloud Functions.

**Note: Runtime Config is currently in beta so things might break!**

## Installation
```
$ npm install --save cloud-functions-runtime-config
```

## Usage
```javascript
var runtimeConfig = require('cloud-functions-runtime-config');

exports.lunchPlanner = function(req, res) {
    runtimeConfig.getVariable('dev-config', 'lunch-plans')
        .then(function(val) {
             console.log(val);
        })
        .catch(function(err) {
             // error handling
        });
};
```

## Basic example

#### Config setup

Create a config resource and store a variable in it.
```
$ gcloud beta runtime-config configs create dev-config
$ gcloud beta runtime-config configs variables \
    set lunch-plans "lets go for a hamburger!" \
    --config-name dev-config
```

#### Cloud function

A basic http function that will read us the variable value.
```javascript
var runtimeConfig = require('cloud-functions-runtime-config');

exports.lunchPlanner = (req, res) => {
    runtimeConfig.getVariable('dev-config', 'lunch-plans')
        .then((val) => res.status(200).send(val))
        .catch((err) => res.status(500).send(err));
};
```

Deploying the function with an http trigger:
```
$ gcloud beta functions deploy lunchPlanner \
    --trigger-http \
    --stage-bucket=<YOUR-BUCKET>
```

Test the function:
```
$ curl https://us-central1-$(gcloud config get-value core/project).cloudfunctions.net/lunchPlanner
```

#### Cleanup
```
$ gcloud beta runtime-config configs delete dev-config
$ gcloud beta functions delete lunchPlanner
```

## License
[The MIT License (MIT)](/LICENSE)
