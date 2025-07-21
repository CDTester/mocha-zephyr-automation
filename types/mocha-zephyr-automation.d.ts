import apiHelper from 'mocha-api-tests';
import { apiConfig } from 'mocha-api-tests/types/apiHelper';
/**
 * Class: Zephyr
 */
export interface zephyrData {
    projectKey: string;
    projectId: number;
    projectName: string;
    testCaseId: number;
    testCaseKey: string;
    testCaseFolderId: number;
    cycleVersion: string;
    cycleFolder: string;
    cycleFolderId: number;
    cycleFolderParent: string[];
    cycleFolderParentId: number;
    environment: string;
    updateZephyr: string;
    version: string;
    versionId: string;
    cycleName: string;
    cycleId: string;
    cycleKey: string;
    executionId: string;
    executionKey: string;
}
export default class zephyrAutomation {
    protected config: zephyrData;
    protected zapi: apiHelper;
    protected url: apiConfig;
    constructor();
    /**
     * checkFoldersExist: gets the cycle details of a project ID
     * @param {string} fldrType - Folder Type (TEST_CASE / TEST_CYCLE / TEST_PLAN)
     * @param {string} projKey - jira proj key
     * @param {string} folderName - name of folder checking to see if exists
     * @param {string[]} folderParent - parents of the cycle folder
     * @param {boolean} log - optional to add result to the report
     * @returns {any} the body of the response for /cycle?projectId=${projectId}
     */
    checkFoldersExist(fldrType: string, projKey: string, folderName: string, folderParent: string[]): Promise<{
        foldersMap: string[];
        folderExists: string[];
    }>;
    /**
     * generateStepResults: creates a summary of the test run from this.test
     * @param {Mocha.Runnable} test - mocha test log
     * @returns {any} step results e.g. [{actualResult: 'user logged in', statusName: 'Pass'}, {}, ...]
     */
    generateStepResults(test: Mocha.Runnable): Promise<object[]>;
    /**
     * generateSuiteReport: creates a summary of the test run from this.test
     * @param {Mocha.Runnable} test - mocha test log
     * @returns {any} object containing the status of the ftest and a message containing the step name and error message
     */
    generatExecutionDetails(test: Mocha.Runnable, error: string): Promise<any>;
    /**
     * setup: collect zephyr ids for execution and clones if required.
     * @param {string} testKey - The test name e.g. JIRA-1234
     */
    setup(testKey: string): Promise<void>;
    /**
     * updateTestExecution: Generates executions comments and status then updates Zephyr execution
     * @param {Mocha.Runnable} results - the mocha.test object
     * @param {object} ids - the object containing version/cycle/execution IDs
     */
    updateTestExecution(results: Mocha.Runnable): Promise<void>;
}
//# sourceMappingURL=mocha-zephyr-automation.d.ts.map