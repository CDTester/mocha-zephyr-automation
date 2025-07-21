// const apiHelper = require('mocha-api-tests').default;
import apiHelper from 'mocha-api-tests';
import { apiConfig } from 'mocha-api-tests/types/apiHelper';
import * as api from './lib/zephyr-apis';
const zephyrConfig = require('config');
const moment = require('moment');


/**
 * Class: Zephyr
 */

export interface zephyrData {
  projectKey: string,
  projectId: number,
  projectName: string,
  testCaseId: number,
  testCaseKey: string,
  testCaseFolderId: number,
  cycleVersion: string,
  cycleFolder: string,
  cycleFolderId: number,
  cycleFolderParent: string[],
  cycleFolderParentId: number,
  environment: string,
  updateZephyr: string,
  version: string,
  versionId: string,
  cycleName: string,
  cycleId: string,
  cycleKey: string,
  executionId: string,
  executionKey: string
}

export default class zephyrAutomation {
  protected config: zephyrData;
  protected zapi: apiHelper;
  protected url: apiConfig;

  constructor () {
    if (zephyrConfig.has('zephyrOptions.token') === false) console.error(`zephyrOptions.token not found in config/default.json file.`);
    if (zephyrConfig.has('zephyrOptions.environment') === false) console.error(`zephyrOptions.environment not found in config/default.json file.`);
    if (zephyrConfig.has('zephyrOptions.project') === false) console.error(`zephyrOptions.project not found in config/default.json file.`);
    if (zephyrConfig.has('zephyrOptions.cycleVersion') === false) console.error(`zephyrOptions.cycleVersion not found in config/default.json file.`);
    if (zephyrConfig.has('zephyrOptions.cycleFolder') === false) console.error(`zephyrOptions.cycleFolder not found in config/default.json file.`);
    if (zephyrConfig.has('zephyrOptions.cycleFolderHieracrhy') === false) console.error(`zephyrOptions.cycleFolderHieracrhy not found in config/default.json file.`);
    if (zephyrConfig.has('zephyrOptions.cycleName') === false) console.error(`zephyrOptions.cycleName not found in config/default.json file.`);
    if (zephyrConfig.has('zephyrOptions.updateZephyr') === false) console.error(`zephyrOptions.updateZephyr not found in config/default.json file.`);

    this.url = {
      baseUrl: `https://api.zephyrscale.smartbear.com/v2`,
      auth: `Bearer ${process.env[zephyrConfig.get('zephyrOptions.token')]}`,
      authType: 'bearer',
      timeout: 5000,
      headers: undefined,
      cookies: undefined,
      responseType: undefined,
      proxy: undefined,
      redirect: undefined,
      config: undefined,
      accept: undefined,
      cacheControl: undefined,
      connection: undefined
    };

    this.zapi = new apiHelper(this.url);


    this.config = {
      projectName: String(process.env[zephyrConfig.get('zephyrOptions.project')]),
      projectKey: undefined,
      projectId: undefined,
      environment: String(process.env[zephyrConfig.get('zephyrOptions.environment')]),
      updateZephyr: String(process.env[zephyrConfig.get('zephyrOptions.updateZephyr')]),
      testCaseId: undefined,
      testCaseKey: undefined,
      testCaseFolderId: undefined,
      cycleVersion: String(process.env[zephyrConfig.get('zephyrOptions.cycleVersion')]),
      cycleFolder: String(process.env[zephyrConfig.get('zephyrOptions.cycleFolder')]),
      cycleFolderId: undefined,
      cycleFolderParent: process.env[zephyrConfig.get('zephyrOptions.cycleFolderHieracrhy')].split(','),
      cycleFolderParentId: undefined,
      version: String(process.env[zephyrConfig.get('zephyrOptions.cycleVersion')]),
      versionId: undefined,
      cycleName: String(process.env[zephyrConfig.get('zephyrOptions.cycleName')]),
      cycleId: undefined,
      cycleKey: undefined,
      executionId: undefined,
      executionKey: undefined
    };
  }


  /**
   * checkFoldersExist: gets the cycle details of a project ID
   * @param {string} fldrType - Folder Type (TEST_CASE / TEST_CYCLE / TEST_PLAN)
   * @param {string} projKey - jira proj key
   * @param {string} folderName - name of folder checking to see if exists
   * @param {string[]} folderParent - parents of the cycle folder
   * @param {boolean} log - optional to add result to the report
   * @returns {any} the body of the response for /cycle?projectId=${projectId}
   */
  async checkFoldersExist (fldrType: string, projKey: string, folderName: string, folderParent: string[]): Promise<{ foldersMap: string[], folderExists: string[] }> {
    try {
      const folders:any = await api.getFolders(this.zapi, fldrType, projKey, false);

      // Build a lookup map for quick parent resolution
      const map = Object.fromEntries(folders.values.map(item => [item.id, item]));

      // Helper function to trace lineage
      function getParents (item) {
        const lineage = [];
        while (item.parentId !== null) {
          const parent = map[item.parentId];
          if (!parent) break;
          lineage.push({ name: parent.name, id: parent.id });
          item = parent;
        }
        return lineage;
      }

      // Build the new array
      const foldersMap = folders.values.map(item => ({ name: item.name, id: item.id, parent: getParents(item) }));

      // find folder containing folder name, if that name exists in multiple folders then filter by the parent structure
      const folderExists = foldersMap.filter((folder) => folder['name'] === folderName)
        .filter(each => each['parent'].every(value => folderParent.includes(value.name)));

      return { foldersMap: foldersMap, folderExists: folderExists };
    }
    catch (err) {
      if (err instanceof Error) console.error(`Could not check to see if folders exist using parentage ${folderParent} ${err.message}`);
    }
  }


  /**
   * generateStepResults: creates a summary of the test run from this.test
   * @param {Mocha.Runnable} test - mocha test log
   * @returns {any} step results e.g. [{actualResult: 'user logged in', statusName: 'Pass'}, {}, ...]
   */
  async generateStepResults (test: Mocha.Runnable): Promise<object[]> {
    const results:object[] = [];

    if (test.parent !== undefined) {
      for (const steps of test.parent.tests) {
        if (steps.state === 'passed') {
          results.push({ actualResult: '', statusName: 'Pass' });
        }
        else if (steps.state === 'pending') {
          results.push({ actualResult: '', statusName: 'Not Executed' });
        }
        else {
          results.push({ actualResult: steps.err.message, statusName: 'Fail' });
        }
      }
    }
    return results;
  }

  /**
   * generateSuiteReport: creates a summary of the test run from this.test
   * @param {Mocha.Runnable} test - mocha test log
   * @returns {any} object containing the status of the ftest and a message containing the step name and error message
   */
  async generatExecutionDetails (test: Mocha.Runnable, error: string): Promise<any> {
    const executionDetails:any = {
      status: '',
      commment: '',
      environment: this.config.environment,
      executionTime: NaN,
      actualEndDate: moment().format('YYYY-MM-DDTHH:mm:ssZ')
    };
    let msg:string = '';
    if (error !== '') {
      msg += `${error}<br>`;
    }
    let state:string = '';
    let duration:number = 0;

    if (test.parent !== undefined) {
      for (const steps of test.parent.tests) {
        if (steps.state === 'passed') {
          msg += `[✔️] ${steps.title} <br>`;
          (state === 'Fail') ? state = 'Fail' : state = 'Pass';
          duration += steps.duration;
        }
        else if (steps.state === 'pending') {
          msg += `[⏳]  ${steps.title} <br>`;
          (state === 'Fail') ? state = 'FAIL' : state = 'Not Executed';
        }
        else {
          msg += `[❌] ${steps.title} <br>`;
          state = 'Fail';
          duration += steps.duration;
        }
      }
      executionDetails.comment = msg;
      executionDetails.status = state;
      executionDetails.executionTime = duration;
    }

    return executionDetails;
  }

  /**
   * setup: collect zephyr ids for execution and clones if required.
   * @param {string} testKey - The test name e.g. JIRA-1234
   */
  async setup (testKey: string) {
    // Get ProjectId depending on Zephyr test key
    this.config.testCaseKey = testKey;
    this.config.projectKey = testKey.split('-')[0];
    const projectDetails = await api.getProjectId(this.zapi, this.config.projectKey, false);
    this.config.projectId = projectDetails.id;

    // check if zephyr is to be updated
    if (this.config.updateZephyr.toLowerCase() === 'yes') {
      console.log('\x1b[33m', `\tZephyr: test execution is to be updated`, '\x1b[0m');

      // get TEST_CASE and Folder
      const testCase:any = await api.getTestCase(this.zapi, testKey, false);  // 
      this.config.testCaseId = testCase.id;
      this.config.testCaseFolderId = testCase.folder.id;

      if (this.config.testCaseId <= 0) {
        console.error('\x1b[31m', `WARNING: test case ID (${this.config.testCaseId}) could not be found for '${testKey}'`, '\x1b[0m');
      }

      // check top level folders exists, if not create them
      const checkFoldersFromRoot = [...this.config.cycleFolderParent];
      let parentOfCheckFoldersFromRoot = [];
      let checkParentFolders;
      let cycleFolderParentId:number = null;
      let cycleFolderId:number = null;
      do {
        checkParentFolders = await this.checkFoldersExist('TEST_CYCLE', this.config.projectKey, checkFoldersFromRoot[0], parentOfCheckFoldersFromRoot);

        if (checkParentFolders.folderExists.length === 0) {
          // create folder
          console.log('\x1b[93m', `\tZephyr: Folder ${checkFoldersFromRoot[0]} does not exist in ${parentOfCheckFoldersFromRoot}. Creating folder ...`, '\x1b[0m');
          const folderCreated = await api.createFolder(this.zapi, 'TEST_CYCLE', this.config.projectKey, cycleFolderParentId, checkFoldersFromRoot[0], false);

          // remove folder from checkFoldersFromRoot
          cycleFolderId = folderCreated.id;
          parentOfCheckFoldersFromRoot = Array(checkFoldersFromRoot.shift());
          if (checkFoldersFromRoot.length > 0) {
            cycleFolderParentId = folderCreated.id;
          }
        }
        else {
          // get cycle folder id and removed it from checkFoldersFromRoot
          cycleFolderId = checkParentFolders.folderExists[0].id;
          parentOfCheckFoldersFromRoot = Array(checkFoldersFromRoot.shift());
          checkParentFolders.folderExists[0].parent.length === 0 ? cycleFolderParentId = cycleFolderId : checkParentFolders.folderExists[0].parent[checkParentFolders.folderExists[0].parent.length - 1].id;
          this.config.cycleFolderParentId = cycleFolderParentId;
        }
      } while (checkFoldersFromRoot.length > 0);

      // check folder exists, if not create it
      const checkFolder = await this.checkFoldersExist('TEST_CYCLE', this.config.projectKey, this.config.cycleFolder, this.config.cycleFolderParent);

      if (checkFolder.folderExists.length === 0) {
        console.log('\x1b[93m', `\tZephyr: Folder ${this.config.cycleFolder} does not exist in ${this.config.cycleFolderParent}. Creating folder ...`, '\x1b[0m');
        const createFolder = await api.createFolder(this.zapi, 'TEST_CYCLE', this.config.projectKey, cycleFolderId, this.config.cycleFolder, false);
        this.config.cycleFolderId = createFolder.id;
      }
      else {
        this.config.cycleFolderId = checkFolder.folderExists[0]['id'];
      }

      // FUTURE ITERATION TO ASSIGN RELEASE VERSION TO THE CYCLE HERE?   ///////////////////////////////////////////////////

      // check cycle exists, if not create it
      const cycles = await api.getTestCycles(this.zapi, this.config.projectKey, this.config.cycleFolderId, undefined, false);

      // if cycle exists then check if test case already exists, if it does then throw error
      const cycle = cycles.values.find((cycle) => cycle.name === this.config.cycleName);
      const cycleExists = (cycle !== undefined) ? true : false;
      if (cycleExists) {
        this.config.cycleId = cycle.id;
        this.config.cycleKey = cycle.key;
      }
      else {
        console.log('\x1b[93m', `\tZephyr: Cycle ${this.config.cycleName} does not exist in folder ${this.config.cycleFolder}. Creating Cycle ...`, '\x1b[0m');
        const createCycle = await api.createCycle(this.zapi, this.config.projectKey, this.config.cycleFolderId, this.config.cycleName, undefined, false);
        this.config.cycleId = createCycle.id;
        this.config.cycleKey = createCycle.key;
      }

      // FUTURE ITERATION TO CHECK THE STATUS OF THE CYCLE HERE?   ///////////////////////////////////////////////////////////////////

      // check if test case already exists in cycle, if not add it to the cycle
      const testExecution = await api.getTestExecutions(this.zapi, this.config.projectKey, testKey, this.config.cycleKey, false);
      if (testExecution.values.length > 0) {
        this.config.executionId = testExecution.values[0].id;
        this.config.executionKey = testExecution.values[0].key;
      }
      else {
        console.log('\x1b[93m', `\tZephyr: Test Case ${testKey} does not exist in cycle ${this.config.cycleName}. Adding Test Case ...`, '\x1b[0m');
        const execution = await api.createTestExecution(this.zapi, this.config.projectKey, testKey, this.config.cycleKey, this.config.environment, false);
        this.config.executionId = execution.id;

        // get execution key
        const testExecution = await api.getTestExecutions(this.zapi, this.config.projectKey, testKey, this.config.cycleKey, false);
        this.config.executionKey = testExecution.values[0].key;
      }

      // FUTURE ITERATION TO CHECK THE STATUS OF THE TEST CASE HERE?   ///////////////////////////////////////////////////////////////////

    }
    else {
      console.log('\x1b[93m', `\tZephyr: test execution will not be updated`, '\x1b[0m');
    }
  }

  /**
   * updateTestExecution: Generates executions comments and status then updates Zephyr execution
   * @param {Mocha.Runnable} results - the mocha.test object
   * @param {object} ids - the object containing version/cycle/execution IDs
   */
  async updateTestExecution (results:Mocha.Runnable) {
    // check if zephyr is to be updated
    if (this.config.updateZephyr.toLowerCase() === 'yes') {
      if (this.config.executionId === '') {
        console.error('\x2b[31m', `WARNING: Zephyr Execution could not be updated because execution ID could not be found for test case ${this.config.testCaseKey}`, '\x1b[0m');
      }
      else {
        // get test exectuition steps
        const steps = await api.getTestExecutionSteps(this.zapi, this.config.executionKey, false);

        // generate step results
        const stepResults = await this.generateStepResults(results);

        // if test results contain more steps than the zephyr test steps, then the steps are not updated
        let errMessage = '';
        if (stepResults.length !== steps.values.length) {
          errMessage = `WARNING, test execution steps could not be updated because the number of autmation steps (${stepResults.length}) do not match the number of Zephyr steps (${steps.values.length})`;
          console.error('\x1b[93m', `\tZephyr: ${errMessage}`, '\x1b[0m');
        }
        else {
          console.error('\x1b[93m', `\tZephyr: Updating test execution steps ...`, '\x1b[0m');
          await api.updateTestExecutionSteps(this.zapi, this.config.executionKey, stepResults, false);
        }

        // generate comment for overall test execution
        console.error('\x1b[93m', `\tZephyr: Updating test execution ...`, '\x1b[0m');
        const details = await this.generatExecutionDetails(results, errMessage);
        await api.updateTestExecution(this.zapi, this.config.executionKey, details, false);
      }
    }
  }
}