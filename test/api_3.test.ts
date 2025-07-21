import envData from '../src/utils/loadEnvData';
import * as dateUtils from '../src/utils/date';
import apiHelper from 'mocha-api-tests';
import { expect } from 'chai';
import { step } from 'mocha-steps';
import addContext from 'mochawesome/addContext';
import zephyrAutomation from '../src/mocha-zephyr-automation/mocha-zephyr-automation';

//description variables
const zephyrTest: string = 'SCRUM-T4';
let show = '';

// initiate classes
const env = new envData('api.test.ts').getEnvData;
const api:apiHelper = new apiHelper(env.api.tv);
const zephyr:zephyrAutomation = new zephyrAutomation();


describe(`API test 3 @api @smoke $JIRA-1234`, function () {

  before(`initiate zephyr`, async function () {
    let zephyrData = await zephyr.setup(zephyrTest);

    addContext(this, {
      title: `Zephyr Details`,
      value: zephyrData
    })
  });


  step(`Get The Boys`, async function () {
    show = 'The Boys';
    let test = await api.getRequest(`search/shows?q=${show}`);

    expect(test.response.status).to.equal(200);
    expect(test.response.statusText).to.equal('OK');

    addContext(this, {title: 'Get tv show Image', value: test.response.data[0].show.image.medium});
    await dateUtils.wait(2000, false);
  });

  step(`Get Reacher`, async function () {
    show = 'Reacher';
    let test = await api.getRequest(`search/shows?q=${show}`);
    expect(test.response.status, 'Response Status not as expected').to.equal(200);
    expect(test.response.statusText).to.equal('OK');

    addContext(this, {title: 'Get tv show Image', value: test.response.data[0].show.image.medium});
    await dateUtils.wait(1500, false);

  });

  step(`Get The Man in the High Castle`, async function () {
    show = 'The Man in the High Castle';
    let test = await api.getRequest(`search/shows?q=${show}`);
    expect(test.response.status).to.equal(200);
    expect(test.response.statusText).to.equal('OK');

    addContext(this, {title: 'Get tv show Image', value: test.response.data[0].show.image.medium});
    await dateUtils.wait(1800, false);
  });

    after(`update zephyr`, async function () {
    if (this.test !== undefined) {
      await zephyr.updateTestExecution(this.test);
    }
  });

});
