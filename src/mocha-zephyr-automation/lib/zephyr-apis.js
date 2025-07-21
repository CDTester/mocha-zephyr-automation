"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectId = getProjectId;
exports.getFolders = getFolders;
exports.createFolder = createFolder;
exports.getTestCase = getTestCase;
exports.getTestCycles = getTestCycles;
exports.createCycle = createCycle;
exports.getTestExecutions = getTestExecutions;
exports.createTestExecution = createTestExecution;
exports.getTestExecutionSteps = getTestExecutionSteps;
exports.updateTestExecutionSteps = updateTestExecutionSteps;
exports.updateTestExecution = updateTestExecution;
const moment = require('moment');
/**
 * getProjectId: gets project ID
 * @param {apiHelper} zapi - Zephyr apiHelper instance
 * @param {string} projKey - jira proj key (not id)
 * @param {boolean} log - optional to add result to console log
 * @returns {any} the body of the response
 */
async function getProjectId(zapi, projKey, log = false) {
    let resp;
    try {
        resp = await zapi.getRequest(`projects/${projKey}`);
        if (log) {
            console.log('\x1b[93m', `Zephyr: getProjectId response for /projects/${projKey}`);
            console.log('\x1b[91m', JSON.stringify(resp.response.data));
        }
        return resp.response.data;
    }
    catch (err) {
        if (err instanceof Error) {
            console.error('\x1b[91m', `\tZephyr: Could not get a list of project ids and cycles using projectId = ${projKey} ${err.message}`);
        }
    }
}
/**
 * getFolders: gets list of folders in a project ID
 * @param {apiHelper} zapi - Zephyr apiHelper instance
 * @param {string} type - folder type TEST_CASE, TEST_CYCLE or TEST_PLAN
 * @param {string} projKey - jira proj key (not id)
 * @param {boolean} log - optional to add result to console log
 * @returns {any} the body of the response
 */
async function getFolders(zapi, type, projKey, log = false) {
    try {
        const query = {
            folderType: type,
            projectKey: projKey,
            maxResults: 999999
        };
        const resp = await zapi.getRequest(`folders`, query);
        if (log) {
            console.log('\x1b[93m', `Zephyr: getFolders response from query ${JSON.stringify(query)}`);
            console.log('\x1b[91m', JSON.stringify(resp.response.data));
        }
        return resp.response.data;
    }
    catch (err) {
        if (err instanceof Error)
            console.error('\x1b[91m', `\tZephyr: Could not get a list of ${type} folder using projectId=:${projKey} ${err.message}`);
    }
}
/**
 * createFolder: create a folder in zephyr
 * @param {apiHelper} zapi - Zephyr apiHelper instance
 * @param {string} type - folder type TEST_CASE, TEST_CYCLE or TEST_PLAN
 * @param {string} projKey - jira proj key (not id)
 * @param {number} parent - parent id of where the folder is to be created
 * @param {string} folderName - name oif the folder to be created
 * @param {boolean} log - optional to add result to console log
 * @returns {any} the body of the response
 */
async function createFolder(zapi, type, projKey, parent, folderName, log = false) {
    try {
        const query = undefined;
        const body = {
            parentId: parent,
            name: folderName,
            projectKey: projKey,
            folderType: type
        };
        const resp = await zapi.postRequest(`folders`, query, body);
        if (log) {
            console.log('\x1b[93m', `Zephyr: created folder ${folderName} in parentId ${parent} using body ${JSON.stringify(body)}`);
            console.log('\x1b[91m', JSON.stringify(resp.response.data));
        }
        return resp.response.data;
    }
    catch (err) {
        if (err instanceof Error)
            console.error('\x1b[91m', `\tZephyr: Could not create folder ${folderName} in parentId ${parent} : ${err.message}`);
    }
}
/**
 * getTestCase: get details of a test case by its key
 * @param {apiHelper} zapi - Zephyr apiHelper instance
 * @param {string} TestCaseKey - Zephyr test case key
 * @param {boolean} log - optional to add result to console log
 * @returns {any} the body of the response
 */
async function getTestCase(zapi, TestCaseKey, log = false) {
    try {
        const resp = await zapi.getRequest(`testcases/${TestCaseKey}`);
        if (log) {
            console.log('\x1b[93m', `\tZephyr: getTestCase response for /testcases/${TestCaseKey}`);
            console.log('\x1b[91m', JSON.stringify(resp.response.data));
        }
        return resp.response.data;
    }
    catch (err) {
        if (err instanceof Error)
            console.error('\x1b[91m', `\tZephyr: Could not get a list of project versions and cycles using projectId=:${TestCaseKey} ${err.message}`);
    }
}
/**
 * getTestCycles: gets the cycle details of a project ID
 * @param {apiHelper} zapi - Zephyr apiHelper instance
 * @param {string} projKey - jira proj key (not id)
 * @param {number} fldrId - zephyr folder id
 * @param {number} projectVersion - project version id
 * @param {boolean} log - optional to add result to console log
 * @returns {any} the body of the response
 */
async function getTestCycles(zapi, projKey, fldrId, projectVersion, log = true) {
    const query = {
        maxRestults: 1000
    };
    try {
        if (projKey !== undefined)
            Object.assign(query, { projectKey: projKey });
        if (fldrId !== undefined)
            Object.assign(query, { folderId: fldrId });
        if (projectVersion !== undefined)
            Object.assign(query, { jiraProjectVersionId: projectVersion });
        const resp = await zapi.getRequest(`testcycles`, query);
        if (log) {
            console.log('\x1b[93m', `\tZephyr: getTestCycles response for ${JSON.stringify(query)}`);
            console.log('\x1b[91m', JSON.stringify(resp.response.data));
        }
        return resp.response.data;
    }
    catch (err) {
        if (err instanceof Error)
            console.error('\x1b[91m', `\tZephyr: Could not get a list of test cycles using params ${query} ${err.message}`);
    }
}
/**
 * createCycle: gets the version and cycle details of a project ID
 * @param {apiHelper} zapi - Zephyr apiHelper instance
 * @param {string} projKey - jira proj key (not id)
 * @param {number} fldrId - zephyr folder id
 * @param {string} cycleName - Name of the folder to be created
 * @param {number} projectVersion - project version id
 * @param {boolean} log - optional to add result to console log
 * @returns {any} the body of the response
 */
async function createCycle(zapi, projKey, fldrId, cycleName, projectVersion, log = true) {
    const query = undefined;
    const body = {
        projectKey: projKey,
        folderId: fldrId,
        name: cycleName,
        description: `${cycleName} created by test automation`,
        plannedStartDate: moment().local().format('YYYY-MM-DD[T]HH:mm:ss[Z]'),
        plannedEndDate: moment().local().add(1, 'h').format('YYYY-MM-DD[T]HH:mm:ss[Z]'),
        statusName: 'In Progress'
    };
    try {
        if (projectVersion !== undefined)
            Object.assign(body, { jiraProjectVersionId: projectVersion });
        const resp = await zapi.postRequest(`testcycles`, query, body);
        if (log) {
            console.log('\x1b[93m', `\tZephyr: createCycle response for ${JSON.stringify(body)}`);
            console.log('\x1b[91m', JSON.stringify(resp.response.data));
        }
        return resp.response.data;
    }
    catch (err) {
        if (err instanceof Error)
            console.error('\x1b[93m', `\tZephyr: Could not create cycle using body ${body} ${err.message}`);
    }
}
/**
 * getTestExecutions: gets list test executions for a given test case
 * @param {apiHelper} zapi - Zephyr apiHelper instance
 * @param {string} projKey - jira proj key (not id)
 * @param {string} testCaseKey - Zephyr test case key (not id)
 * @param {string} testCycleKey - Optional. Name of the cycle where the executions are
 * @param {boolean} log - optional to add result to console log
 * @returns {any} the body of the response
 */
async function getTestExecutions(zapi, projKey, testCaseKey, testCycleKey, log = false) {
    const query = {
        projectKey: projKey,
        testCase: testCaseKey
    };
    try {
        if (testCycleKey !== undefined)
            Object.assign(query, { testCycle: testCycleKey });
        const resp = await zapi.getRequest(`testexecutions`, query);
        if (log) {
            console.log(`Zephyr: getTestExecutions response for ${JSON.stringify(query)}`);
            console.log(JSON.stringify(resp.response.data));
        }
        return resp.response.data;
    }
    catch (err) {
        if (err instanceof Error)
            console.error(`Could not get a list of test executions using params ${query} ${err.message}`);
    }
}
/**
 * createTestExecution: create a test execution for a given test case in a given cycle
 * @param {apiHelper} zapi - Zephyr apiHelper instance
 * @param {string} projKey - jira proj key (not id)
 * @param {string} testKey - Zephyr test case key (not id)
 * @param {string} cycleKey - Name of the cycle where the executions are
 * @param {string} env - Name of the environment where the execution is to be run
 * @param {boolean} log - optional to add result to console log
 * @returns {any} the body of the response
 */
async function createTestExecution(zapi, projKey, testKey, cycleKey, env, log = false) {
    const query = undefined;
    const body = {
        projectKey: projKey,
        testCaseKey: testKey,
        testCycleKey: cycleKey,
        environmentName: env,
        statusName: 'Not Executed',
        comment: ''
    };
    try {
        const resp = await zapi.postRequest(`testexecutions`, query, body);
        if (log) {
            console.log('\x1b[93m', `\tZephyr: createTestExecution response for ${JSON.stringify(body)}`);
            console.log('\x1b[91m', JSON.stringify(resp.response.data));
        }
        return resp.response.data;
    }
    catch (err) {
        if (err instanceof Error)
            console.error('\x1b[91m', `\tZephyr: Could not create test execution using params ${body} ${err.message}`);
    }
}
/**
 * getTestExecutionSteps: gets list of execution steps for a given test execution
 * @param {apiHelper} zapi - Zephyr apiHelper instance
 * @param {string} executionKey - Zephyr test execution key
 * @param {boolean} log - optional to add result to console log
 * @returns {any} the body of the response
 */
async function getTestExecutionSteps(zapi, executionKey, log = false) {
    try {
        const resp = await zapi.getRequest(`testexecutions/${executionKey}/teststeps`);
        if (log) {
            console.log('\x1b[93m', `\tZephyr: getTestExecutionSteps response for /testexecutions/${executionKey}/teststeps`);
            console.log('\x1b[91m', JSON.stringify(resp.response.data));
        }
        return resp.response.data;
    }
    catch (err) {
        if (err instanceof Error)
            console.error('\x1b[91m', `\tZephyr: Could not get test execution steps using params /testexecutions/${executionKey}/teststeps ${err.message}`);
    }
}
/**
 * updateTestExecutionSteps: updates the steps of a test execution
 * @param {apiHelper} zapi - Zephyr apiHelper instance
 * @param {string} executionKey - Zephyr test execution key
 * @param {string[]} stepResults - Array of steps e.g [{actualResult: 'user logged in', statusName: 'Pass'}, {}, ...]. Valid statusName are: 'Pass', 'Fail', 'Not Executed', 'In Progress', 'Blocked'
 * @param {boolean} log - optional to add result to console log
 * @returns {any} the body of the response, this will return 200 OK, or 422 if steps are not matching
 */
async function updateTestExecutionSteps(zapi, executionKey, stepResults, log = false) {
    const query = undefined;
    const body = {
        steps: stepResults
    };
    try {
        const resp = await zapi.putRequest(`testexecutions/${executionKey}/teststeps`, query, body);
        if (log) {
            console.log('\x1b[93m', `\tZephyr: updateTestExecutionSteps response for ${JSON.stringify(body)}`);
            console.log('\x1b[91m', JSON.stringify(resp.response.data));
        }
        return resp.response.data;
    }
    catch (err) {
        if (err instanceof Error)
            console.error('\x1b[93m', `\tZephyr: Could not update test execution steps using params ${body} ${err.message}`);
    }
}
/**
 * updateTestExecution: updates the test execution
 * @param {apiHelper} zapi - Zephyr apiHelper instance
 * @param {string} executionKey - Zephyr test execution key
 * @param {string[]} details - Array of steps e.g [{actualResult: 'user logged in', statusName: 'Pass'}, {}, ...]. Valid statusName are: 'Pass', 'Fail', 'Not Executed', 'In Progress', 'Blocked'
 * @param {boolean} log - optional to add result to console log
 * @returns {any} the body of the response for /util.versionBoard-list?projectId=${projectId}
 */
async function updateTestExecution(zapi, executionKey, details, log = false) {
    const query = undefined;
    const body = {
        statusName: details.status,
        environmentName: details.environment,
        actualEndDate: details.actualEndDate,
        executionTime: details.executionTime,
        comment: details.comment
    };
    try {
        const resp = await zapi.putRequest(`testexecutions/${executionKey}`, query, body);
        if (log) {
            console.log('\x1b[93m', `\tZephyr: updateTestExecution response for ${JSON.stringify(body)}`);
            console.log('\x1b[91m', JSON.stringify(resp.response.data));
        }
        return resp.response.data;
    }
    catch (err) {
        if (err instanceof Error)
            console.error('\x1b[91m', `\tZephyr: Could not update test execution using params ${body} ${err.message}`);
    }
}
