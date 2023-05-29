/**
 * This migration script add default project abac rules
 * to the abacs collection.
 */
const Promise         = require('bluebird');
const _               = require('lodash');
const logger          = require('cf-logs');
const { MongoClient } = require('mongodb');

const errors = [];

let db = null;
let connection = null;
let accountsCollection   = null;
let abacsCollection   = null;
let teamsCollection = null;
let totalupdated = 0;
let totalAccounts = 0;


async function migration() {
    const accountQuery = {}
    const envAccountName = process.env.ACCOUNT_NAME;
    if (envAccountName) {
        accountQuery.name = envAccountName
    }
    console.log('Querying accounts...')
    const accounts = await accountsCollection.find(accountQuery).project({name: 1}).toArray();
    totalAccounts = accounts.length;
    console.log(`Total account to update: ${totalAccounts}`)

    await Promise.map(accounts, migrateAccount, {concurrency: 20});
}

async function migrateAccount(account, index) {
    console.log('--------------')
    console.log(`account ${index} from ${totalAccounts} -- [${account._id} -- ${account.name}]`);
    const defaultTeam = await teamsCollection.findOne({account: account._id, type: 'default'});
    if (!defaultTeam) {
        console.log(`No default team for account ${account._id}`)
        return;
    }
    const defaultRules = [
        {
            'account': account._id,
            'action': 'read',
            'team': defaultTeam._id,
            'resource': 'project',
            'tags': ['*']
        },
        {
            'account': account._id,
            'action': 'update',
            'team': defaultTeam._id,
            'resource': 'project',
            'tags': ['*']
        },
        {
            'account': account._id,
            'action': 'create',
            'team': defaultTeam._id,
            'resource': 'project',
            'tags': []
        },
        {
            'account': account._id,
            'action': 'delete',
            'team': defaultTeam._id,
            'resource': 'project',
            'tags': ['*']
        }
    ];
    await create(defaultRules);
    console.log('--------------')
}

const migrate = () => {
    logger.info('Starting to migrate accounts abac projects');
    return MongoClient.connect(process.env.MONGO_URI, { promiseLibrary: Promise })
        .then((_connection) => {
            logger.info(`Connection established to: ${process.env.MONGO_URI}`);
            connection = _connection
            db = connection.db();
            accountsCollection   = db.collection('accounts');
            abacsCollection = db.collection('abacs');
            teamsCollection = db.collection('teams');
        })
        .then(() => migration())
        .then(() => {
            console.log('Finished update accounts project abac');
            console.log(`Total updated: ${totalupdated} out of ${totalAccounts}`);
            if (errors.length > 0) {
                logger.error('--- ERRORS ---');
            }
        })
        .catch((e) => {
            console.error('problem migrating');
            console.error(e);
            console.error(e);
        });
};

const create = async (rules) => {
    const query = rules.map((r) => {
        return {
            team: r.team,
            action: r.action,
            account: r.account,
            resource: r.resource,
            tags: r.tags
        };
    });

    const exists = await abacsCollection.find({ $or: query }).toArray();

    // filter rule if it was stored
    const filtered = rules.filter((r) => {
        return !exists.find((i) => {
            return i.team.toString() === r.team.toString() &&
                i.action === r.action &&
                i.resource === r.resource &&
                _.isEqual(i.tags.sort(), r.tags.sort());
        });
    });
    if (!_.isEmpty(filtered)) {
        console.log(`creating project abac rules for ${rules[0].account}`);
        await abacsCollection.insertMany(filtered);
        totalupdated++;
    } else {
        console.log(`skip creating project abac since it already exists`)
    }
};

migrate()
    .then(
        () => {
            if (connection) {
                connection.close();
            }
            process.exit();
        }
    );
