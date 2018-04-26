const {google} = require('googleapis');
const runtimeConfig = google.runtimeconfig('v1beta1');

module.exports = {
    getVariables: getVariables,
    getVariable: getVariable,
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
            const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT;
            
            if (projectId === undefined) {
                throw new Error('The environment variable GOOGLE_CLOUD_PROJECT or GCLOUD_PROJECT is missing');    
            }
            
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

/**
 * auth
 *
 * @desc Authenticates using default credentials
 *
 * @return {Promise} Promise that resolves an authClient
 */
function auth() {
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
