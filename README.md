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

runtimeConfig.getVariable('dev-config', 'lunch-plans')
    .then(function(val) {
         console.log(val);
    })
    .catch((err) => {
         // error handling
    });
```

## License
[The MIT License (MIT)](/LICENSE)
