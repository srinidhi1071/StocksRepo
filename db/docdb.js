"use strict"
var AWS = require("aws-sdk");
const fileName = "docdb.js"

module.exports = class DocDB {

    constructor(accessKeyId, secretAccessKey, endpoint) {
        this.awsConfig = {
            "region": "us-east-1",
            "endpoint": endpoint,
            "accessKeyId": accessKeyId, "secretAccessKey": secretAccessKey
        };

    }

    getDbClient() {
        this.dynamoClient = null;
        if (this.dynamoClient == null || this.dynamoClient == undefined) {
            AWS.config.update(this.awsConfig);
            this.dynamoClient = new AWS.DynamoDB.DocumentClient();
            return Promise.resolve(this.dynamoClient)
        }
        return Promise.resolve(this.dynamoClient)
    }

    async findAll(params) {

        try {
            let scanResults = [];
            let items;
            let db = await this.getDbClient()
            do {
                items = await db.scan(params).promise()
                items.Items.forEach((item) => scanResults.push(item));
                params.ExclusiveStartKey = items.LastEvaluatedKey;
            } while (typeof items.LastEvaluatedKey !== "undefined");
            console.log(`${fileName}: findAll - Successfully completed findAll operation`);
            return scanResults
        }
        catch (error) {
            throw error
        }
    }

    findOne(params) {
        return new Promise((resolve, reject) => {
            this.getDbClient()
                .then(db => {
                    db.get(params, function (err, data) {
                        if (err) {
                            console.log(`${fileName}: findOne - Error during findOne get operation`);
                            reject(err)
                        }
                        else {
                            console.log(`${fileName}: findOne - Successfully completed findOne operation`);
                            resolve(data)
                        }

                    })

                })
                .catch(error => {
                    console.log(`${fileName}: findOne - Error during findOne operation`)
                    reject(error)
                })

        })
    }

    async find(params) {

        try {
            let scanResults = [];
            let items;
            let db = await this.getDbClient()
            do {
                items = await db.scan(params).promise()
                items.Items.forEach((item) => scanResults.push(item));
                params.ExclusiveStartKey = items.LastEvaluatedKey;
            } while (typeof items.LastEvaluatedKey !== "undefined");
            console.log(`${fileName}: find - Successfully completed find operation`);
            return scanResults;

        }
        catch (error) {
            console.log(`${fileName}: find - Error during find get operation`)
            throw error
        }
    }

    insertOne(params) {
        return new Promise((resolve, reject) => {
            this.getDbClient()
                .then(db => {
                    db.put(params, function (err, data) {
                        if (err) {
                            console.log(`${fileName}: insertOne - Error during insertOne operation`);
                            reject(err)
                        }
                        else {
                            console.log(`${fileName}: insertOne - Successfully completed insertOne operation`);
                            resolve(data)
                        }

                    })
                })
                .catch(error => {
                    console.log(`${fileName}: insertOne - Error during insertOne operation`)
                    reject(error)
                })
        })
    }

}