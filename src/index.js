const {google} = require('googleapis');
const runtimeConfig = google.runtimeconfig('v1beta1');

var keyFile;

module.exports = {
    getVariables: getVariables,
    getVariable: getVariable,
    setKeyFile: setKeyFile,
};

/**
 * runtimeConfig.getVariables
 *
 * @desc Reads a list of runtime config values
 *
 * @param {string} configName The config name of the variables to return
 * @param {Array} variableNames The list of variable names to read
 * @return {Promise} Promise that resolves an array of the variable values
 */
function getVariables(configName, variableNames) {
    return Promise.all(variableNames.map(function(variableName) {
        return getVariable(configName, variableName);
    }));
}

/**
 * runtimeConfig.getVariable
 *
 * @desc Reads a runtime config value
 *
 * @param {string} configName The config name of the variable to return
 * @param {string} variableName The variable name of the variable to return
 * @return {Promise} Promise that resolves the variable value
 */
function getVariable(configName, variableName) {
    return new Promise(function(resolve, reject) {
        auth().then(function(authClient) {
            const projectId = process.env.GCLOUD_PROJECT;
            const fullyQualifiedName = 'projects/' + projectId
                    + '/configs/' + configName
                    + '/variables/' + variableName;

            runtimeConfig.projects.configs.variables.get({
                auth: authClient,
                name: fullyQualifiedName,
            }, function(err, res) {
                if (err) {
                    reject(err);
                    return;
                }

                const variable = res.data;
                if (typeof variable.text !== 'undefined') {
                    resolve(variable.text);
                } else if (typeof variable.value !== 'undefined') {
                    resolve(Buffer.from(variable.value, 'base64').toString());
                } else {
                    reject(new Error('Property text or value not defined'));
                }
            });
        });
    });
}

function setKeyFile(path) {
    keyFile = path;
}

/**
 * auth
 *
 * @desc Authenticates using default credentials, or keyFile if supplied using setKeyFile
 *
 * @return {Promise} Promise that resolves an authClient
 */
function auth() {
    if(keyFile) {
        return authFromKeyFile();
    }

    return new Promise(function(resolve, reject) {
        google.auth.getApplicationDefault(function(err, authClient, projectId) {
            if (err) {
                reject(err);
                return;
            }

            if (authClient.createScopedRequired
                && authClient.createScopedRequired()
               ) {
                const scopes = [
                    'https://www.googleapis.com/auth/cloud-platform',
                    'https://www.googleapis.com/auth/cloudruntimeconfig',
                ];
                authClient = authClient.createScoped(scopes);
            }

            resolve(authClient);
        });
    });
}

function authFromKeyFile() {
    const key = require(keyFile);
    const jwtClient = new google.auth.JWT(
        key.client_email,
        null,
        key.private_key,
        ['https://www.googleapis.com/auth/cloud-platform',
            'https://www.googleapis.com/auth/cloudruntimeconfig'], // an array of auth scopes
        null
    );

    jwtClient.authorize(function (err, tokens) {
        if (err) {
            console.log(err);
            return;
        }
    });

    return Promise.resolve(jwtClient);
}
