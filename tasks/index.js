'use strict';

var del = require('del');
var GlobalsFormatter = require('es6-module-transpiler-globals-formatter');
var gulp = require('gulp');
var gutil = require('gulp-util');
var jspm = require('jspm');
var jspmCore = require('jspm/lib/core');
var karma = require('karma').server;
var lodash = require('engine-lodash');
var merge = require('merge');
var open = require('open');
var path = require('path');
var plugins = require('gulp-load-plugins')();
var renamer = require('gulp-es6-imports-renamer');
var runSequence = require('run-sequence');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');
var soyparser = require('soyparser');
var templates = require('./lib/templates');
var through = require('through2');
var transpile = require('gulp-es6-module-transpiler');

function handleError(error) {
  console.error(error.toString());

  this.emit('end');
}

module.exports = function(options) {
  var bundleFileName = options.bundleFileName;
  var corePathFromSoy = options.corePathFromSoy || 'aui';
  var taskPrefix = options.taskPrefix || '';
  var buildDest = options.buildDest || 'build';
  var buildSrc = options.buildSrc || 'src/**/*.js';
  var jspmConfigFile = options.jspmConfigFile || 'config.js';
  var soyBase = options.soyBase;
  var soyDest = options.soyDest || 'src';
  var soyGenerationGlob = options.soyGenerationGlob === undefined ? '*.soy' : options.soyGenerationGlob;
  var soyGeneratedOutputGlob = options.soyGeneratedOutputGlob === undefined ? '*.soy' : options.soyGeneratedOutputGlob;
  var soySrc = options.soySrc || 'src/**/*.soy';
  var globalName = options.globalName || 'aui';

  gulp.task(taskPrefix + 'build:globals', [taskPrefix + 'soy'], function() {
    return gulp.src(buildSrc)
      .pipe(sourcemaps.init())
      .pipe(renamer({
        basePath: process.cwd(),
        configPath: path.resolve(jspmConfigFile)
      })).on('error', handleError)
      .pipe(transpile({
        basePath: process.cwd(),
        bundleFileName: bundleFileName,
        formatter: new GlobalsFormatter({
          globalName: globalName
        })
      }))
      .pipe(babel({
        blacklist: 'useStrict',
        compact: false
      })).on('error', handleError)
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest(buildDest));
  });

  gulp.task(taskPrefix + 'jspm', function(done) {
    jspm.promptDefaults(true);
    jspm.install(true, {
      lock: true
    }).then(function() {
      return jspmCore.checkDlLoader();
    }).then(function() {
      return jspmCore.setMode('local');
    }).then(function() {
      gutil.log(gutil.colors.cyan('Install complete'));
      done();
    }, function(err) {
      gutil.log(gutil.colors.red('err', err.stack || err));
      gutil.log(gutil.colors.red('Installation changes not saved.'));
      done();
    });
  });

  gulp.task(taskPrefix + 'soy', function(done) {
    gulp.src(soySrc, {base: soyBase})
      .pipe(plugins.if(soyGenerationGlob, generateTemplatesAndExtractParams()))
      .pipe(plugins.if(soyGeneratedOutputGlob, gulp.dest(buildDest)))
      .pipe(plugins.if(!soyGeneratedOutputGlob, plugins.if(soyGenerationGlob, gulp.dest('temp'))))
      .pipe(plugins.soynode({
        loadCompiledTemplates: false,
        shouldDeclareTopLevelNamespaces: false
      }))
      .pipe(plugins.ignore.exclude('*.soy'))
      .pipe(plugins.wrapper({
        header: getHeaderContent(corePathFromSoy),
        footer: getFooterContent
      }))
      .pipe(gulp.dest(soyDest))
      .on('end', function() {
        del('temp', done);
      });
  });

  gulp.task(taskPrefix + 'test', function(done) {
    return runSequence(taskPrefix + 'test:unit', done);
  });

  gulp.task(taskPrefix + 'test:unit', [taskPrefix + 'soy'], function(done) {
    runKarma({}, done);
  });

  gulp.task(taskPrefix + 'test:coverage', [taskPrefix + 'soy'], function(done) {
    runKarma({}, function() {
      open(path.resolve('coverage/lcov/lcov-report/index.html'));
      done();
    });
  });

  gulp.task(taskPrefix + 'test:browsers', [taskPrefix + 'soy'], function(done) {
    runKarma({
      browsers: ['Chrome', 'Firefox', 'Safari', 'IE9 - Win7', 'IE10 - Win7', 'IE11 - Win7']
    }, done);
  });

  gulp.task(taskPrefix + 'test:saucelabs', [taskPrefix + 'jspm', taskPrefix + 'soy'], function(done) {
    var launchers = {
      sl_chrome: {
        base: 'SauceLabs',
        browserName: 'chrome'
      },
      sl_safari: {
        base: 'SauceLabs',
        browserName: 'safari'
      },
      sl_firefox: {
        base: 'SauceLabs',
        browserName: 'firefox'
      },
      sl_ie_9: {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        platform: 'Windows 7',
        version: '9'
      },
      sl_ie_10: {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        platform: 'Windows 7',
        version: '10'
      },
      sl_ie_11: {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        platform: 'Windows 8.1',
        version: '11'
      },
      sl_iphone: {
        base: 'SauceLabs',
        browserName: 'iphone',
        platform: 'OS X 10.10',
        version: '7.1'
      },
      sl_android_4: {
        base: 'SauceLabs',
        browserName: 'android',
        platform: 'Linux',
        version: '4.4'
      },
      sl_android_5: {
        base: 'SauceLabs',
        browserName: 'android',
        platform: 'Linux',
        version: '5.0'
      }
    };

    runKarma({
      browsers: Object.keys(launchers),

      browserDisconnectTimeout: 10000,
      browserDisconnectTolerance: 2,
      browserNoActivityTimeout: 240000,

      captureTimeout: 240000,
      customLaunchers: launchers,

      reporters: ['coverage', 'progress', 'saucelabs'],

      sauceLabs: {
        testName: 'AlloyUI tests',
        recordScreenshots: false,
        startConnect: true,
        connectOptions: {
          port: 5757,
          'selenium-version': '2.41.0',
          logfile: 'sauce_connect.log'
        }
      }
    }, done);
  });

  gulp.task(taskPrefix + 'test:watch', [taskPrefix + 'soy'], function(done) {
    gulp.watch(soySrc, [taskPrefix + 'soy']);

    runKarma({
      singleRun: false
    }, done);
  });
};

// Private helpers
// ===============

function addTemplateParam(filePath, namespace, templateName, param) {
  var soyJsPath = filePath + '.js';
  templateName = namespace + '.' + templateName;
  templateParams[soyJsPath] = templateParams[soyJsPath] || {};
  templateParams[soyJsPath][templateName] = templateParams[soyJsPath][templateName] || [];
  templateParams[soyJsPath][templateName].push(param);
}

function createComponentElementSoy(moduleName, hasElementTemplate) {
  var data = {
    className: moduleName.toLowerCase(),
    moduleName: moduleName
  };
  var soy = lodash.renderSync(templates.ComponentElement, data);
  if (!hasElementTemplate) {
    soy += lodash.renderSync(templates.ModuleNameElement, data);
  }
  return soy;
}

function createComponentSoy(moduleName) {
  return lodash.renderSync(templates.ModuleName, {moduleName: moduleName});
}

function createComponentTemplateSoy(moduleName) {
  return lodash.renderSync(templates.ComponentTemplate, {moduleName: moduleName});
}

function createSurfaceElementSoy(moduleName, surfaceName, hasElementTemplate) {
  if (!hasElementTemplate) {
    return lodash.renderSync(templates.SurfaceElement, {
      moduleName: moduleName,
      surfaceName: surfaceName
    });
  }
  return '';
}

function createSurfaceSoy(moduleName, surfaceName) {
  return lodash.renderSync(templates.Surface, {
    moduleName: moduleName,
    surfaceName: surfaceName
  });
}

function generateDelTemplate(namespace, templateName, hasElementTemplate) {
  var moduleName = namespace.substr(10);
  if (templateName === 'content') {
    return createComponentSoy(moduleName) + createComponentTemplateSoy(moduleName) +
      createComponentElementSoy(moduleName, hasElementTemplate);
  } else {
    return createSurfaceElementSoy(moduleName, templateName, hasElementTemplate) +
      createSurfaceSoy(moduleName, templateName);
  }
}

var templateParams = {};
function generateTemplatesAndExtractParams() {
  return through.obj(function(file, encoding, callback) {
    var fileString = file.contents.toString(encoding);
    fileString += '\n// The following templates were generated by alloyui-tasks.\n' +
      '// Please don\'t edit them by hand.\n';

    var parsed = soyparser(file.contents);
    var namespace = parsed.namespace;
    var moduleName = namespace.substr(10);
    var hasElementTemplateMap = getHasElementTemplateMap(parsed.templates);

    parsed.templates.forEach(function(cmd) {
      if (cmd.deltemplate) {
        return;
      }

      var fullName = cmd.name === 'content' ? moduleName : moduleName + '.' + cmd.name;
      fileString += generateDelTemplate(namespace, cmd.name, hasElementTemplateMap[fullName]);

      cmd.params.forEach(function(tag) {
        if (tag.name !== '?') {
          addTemplateParam(file.relative, namespace, cmd.name, tag.name);
        }
      });
    });

    file.contents = new Buffer(fileString);
    this.push(file);
    callback();
  });
}

function getFooterContent(file) {
  var footer = '';
  var fileParams = templateParams[file.relative];
  for (var templateName in fileParams) {
    footer += '\n' + templateName + '.params = ' + JSON.stringify(fileParams[templateName]) + ';';
  }
  return footer + '\n/* jshint ignore:end */\n';
}

function getHasElementTemplateMap(templateCmds) {
  var hasElementTemplateMap = {};
  templateCmds.forEach(function(cmd) {
    if (cmd.deltemplate && cmd.variant === 'element') {
      hasElementTemplateMap[cmd.name] = true;
    }
  });
  return hasElementTemplateMap;
}

function getHeaderContent(corePathFromSoy) {
  return function(file) {
    var corePath = corePathFromSoy;
    if (typeof corePath === 'function') {
      corePath = corePathFromSoy(file);
    }
    var registryModulePath = path.join(corePath, '/component/ComponentRegistry');
    return '/* jshint ignore:start */\n' +
      'import ComponentRegistry from \'' + registryModulePath + '\';\n' +
      'var Templates = ComponentRegistry.Templates;\n';
  };
}

function runKarma(config, done) {
  config = merge({
    configFile: path.resolve('karma.conf.js'),
    singleRun: true
  }, config);
  karma.start(config, done);
}
