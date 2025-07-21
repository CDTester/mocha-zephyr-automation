import envData from '../src/utils/loadEnvData';
import * as dateUtils from '../src/utils/date';
import apiHelper from 'mocha-api-tests';
import { expect } from 'chai';
import { step } from 'mocha-steps';
import addContext from 'mochawesome/addContext';
import zephyrAutomation from '../src/mocha-zephyr-automation/mocha-zephyr-automation';

//description variables
const zephyrTest: string = 'SCRUM-T1';
let show = 'lost';

// initiate classes
const env = new envData('api.test.ts').getEnvData;
const api:apiHelper = new apiHelper(env.api.tv);
const zephyr:zephyrAutomation = new zephyrAutomation();


describe(`API test 1 @api @smoke $JIRA-1234`, function () {

  before(`initiate zephyr`, async function () {
    let zephyrData = await zephyr.setup(zephyrTest);

    addContext(this, {
      title: `Zephyr Details`,
      value: zephyrData
    })
  });


  step(`Get Lost`, async function () {
    let test = await api.getRequest(`search/shows?q=${show}`);

    expect(test.response.status).to.equal(200);
    expect(test.response.statusText).to.equal('OK');

    addContext(this, {title: 'Get tv show Image', value: test.response.data[0].show.image.medium});
    await dateUtils.wait(2000, false);
  });

  step(`Get Game of Thrones`, async function () {
    show = 'game of thrones';
    let test = await api.getRequest(`search/shows?q=${show}`);
    expect(test.response.status, 'Response Status not as expected').to.equal(200);
    expect(test.response.statusText).to.equal('OK');

    addContext(this, {title: 'Get tv show Image', value: test.response.data[0].show.image.medium});
    await dateUtils.wait(1500, false);

  });

  step(`Get The Expanse`, async function () {
    show = 'the expanse';
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
