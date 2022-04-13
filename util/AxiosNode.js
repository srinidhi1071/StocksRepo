const { default: axios } = require("axios")
const axiosRetry = require('axios-retry');
var fileName = "AxiosNode.js"

function axiosCall(request) {
    return new Promise((resolve, reject) => {

        try {
            axiosRetry(axios, {
                retries: 3,
                shouldResetTimeout: true,
                retryDelay: (retryCount) => {
                    console.log(`retry attempt: ${retryCount}`);
                    return retryCount * 2000; // time interval between retries
                },
                retryCondition: (_error) => true // retry no matter what
            });
            axios(request)
                .then(response => {
                    console.log(`['${fileName}']: AxiosCall - Success: ${JSON.stringify(response.status)}`)
                    resolve(response)
                })
                .catch(error => {
                    console.log(`['${fileName}']: AxiosCall - Failed: ${JSON.stringify(error.message)}`)
                    if (error.response) {
                        reject({ statusCode: error.response.status, body: error.message })
                    }
                    else {
                        reject({ statusCode: 500, body: "read ECONNRESET" })
                    }
                })
        }
        catch (error) {
            console.log(`['${fileName}']: AxiosCall - Failed with Error: ${error}`)
            reject({ statusCode: 500, body: error })
        }
    })
}

module.exports = {
    axiosCall
}