'use strict';

module.exports = {
    'allow-uncaught': false,
    'async-only': false,
    bail: false,
    'check-leaks':false,
    color: true,
    diff: true,
    exit: false, 
    'full-trace': false,
    global: ['$'],
    'inline-diffs': true,
    jobs: 3,
    package: './package.json',
    parallel: false,
    recursive: true,
    reporter: 'mochawesome',
    'reporter-option': [
        'code=false',
        'inline=true',
        'json=false',
        'html=true',
        'reportDir=test_report',
        'reportFilename=test-report.html',
        'reportPageTitle=Test Report'
    ],
    require: [
        "mocha-steps",
        "ts-node/register",
        "mochawesome/register"
    ],
    retries: 0,
    slow: '600',
    sort: false,
    spec: ['test/*'],
    timeout: '120000',
    'trace-warnings': false,
    ui: 'bdd', // Other options: 'tdd', 'qunit', 'exports'
    'v8-stack-trace-limit': 100,
    watch: false
};
