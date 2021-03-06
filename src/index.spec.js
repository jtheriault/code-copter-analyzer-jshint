'use strict';
describe('JSHint analyzer', function describeJshintAnalyzer () {
    var Analyzer = require('code-copter-sdk').Analyzer,
        Analysis = require('code-copter-sdk').Analysis,
        FileSourceData = require('code-copter-sdk').FileSourceData,
        fs = require('fs'),
        jshint = require('jshint'),
        jshintAnalyzer = require('.');

    it('should export an analyzer', function shouldExportAnalyzer () {
        expect(jshintAnalyzer).toEqual(jasmine.any(Analyzer));
    });

    it('should produce an analysis from file source data', function analyze () {
        var testFileSourceData;

        testFileSourceData = new FileSourceData({
            text: 'test'
        }); 

        expect(jshintAnalyzer.analyze(testFileSourceData)).toEqual(jasmine.any(Analysis));
    });

    describe('configuration', function describeConfiguration () {
        var testConfiguration;

        beforeEach(function prepareTestData () {
            testConfiguration = {
                atLeastGiveMeAHint: true
            };
            
            spyOn(jshint, 'JSHINT');
            jshint.JSHINT.errors = [];

            spyOn(fs, 'readFileSync');
        });

        it('should use the provided configuration', function configure () {
            jshintAnalyzer.configure(testConfiguration);
            jshintAnalyzer.analyze({});

            expect(jshint.JSHINT).toHaveBeenCalledWith(undefined, testConfiguration);
        });

        it('should error if provided configuration is false', function configure () {
            expect(function callConfigure () {
                jshintAnalyzer.configure(false);
            }).toThrow();
        });

        it('should use the configuration from jshintrc', function configure () {
            var mockCwd = '/house/luser',
                expectedPath = mockCwd + '/.jshintrc';

            spyOn(process, 'cwd').and.returnValue(mockCwd);
            fs.readFileSync.and.returnValue(JSON.stringify(testConfiguration));

            jshintAnalyzer.configure(true);
            jshintAnalyzer.analyze({});

            expect(fs.readFileSync).toHaveBeenCalledWith(expectedPath, 'utf8');
            expect(jshint.JSHINT).toHaveBeenCalledWith(undefined, testConfiguration);
        });

        it('should use default configuration if no file is found', function configure () {
            spyOn(console, 'warn');

            fs.readFileSync.and.throwError();
            
            jshintAnalyzer.configure(true);
            jshintAnalyzer.analyze({});

            expect(console.warn).toHaveBeenCalledWith(jasmine.stringMatching(/.jshintrc/));
            expect(jshint.JSHINT).toHaveBeenCalledWith(undefined, undefined);
        });
    });
});
