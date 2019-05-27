"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var path = require("path");
var debug = require('debug')('serverless-sqs-local');
var sqs_localhost_1 = require("sqs-localhost");
var ServerlessElasticmqLocal = /** @class */ (function () {
    function ServerlessElasticmqLocal(serverless, options) {
        this.serverless = serverless;
        this.service = serverless.service;
        this.serverlessLog = serverless.cli.log.bind(serverless.cli);
        this.config = (this.service.custom && this.service.custom.sqs) || {};
        this.sqsLocal = new sqs_localhost_1.default();
        this.options = _.merge({
            installPath: serverless.config && path.join(serverless.config.servicePath, '.sqs'),
        }, options);
        this.provider = 'aws';
        this.commands = {
            sqs: {
                commands: {
                    start: {
                        lifecycleEvents: ['startHandler'],
                        usage: 'Starts local SQS',
                        options: {
                            //   port: {
                            //     shortcut: 'p',
                            //     usage:
                            //       'The port number that SQS will use to communicate with your application.
                            // If you do not specify this option, the default port is 8000',
                            //   },
                            migrate: {
                                shortcut: 'm',
                                usage: 'After starting SQS local, create SQS tables from the current serverless configuration.',
                            },
                            migration: {
                                shortcut: 'm',
                                usage: 'After starting SQS local, run SQS migrations',
                            },
                        },
                    },
                    // noStart: {
                    //   shortcut: 'n',
                    //   default: false,
                    //   usage: 'Do not start SQS local (in case it is already running)',
                    // },
                    remove: {
                        lifecycleEvents: ['removeHandler'],
                        usage: 'Removes local SQS',
                    },
                    install: {
                        usage: 'Installs local SQS',
                        lifecycleEvents: ['installHandler'],
                        options: {
                            installPath: {
                                shortcut: 'x',
                                usage: 'Local SQS install path',
                            },
                        },
                    },
                },
            },
        };
        this.hooks = {
            'sqs:remove:removeHandler': this.removeHandler.bind(this),
            'sqs:install:installHandler': this.installHandler.bind(this),
            'sqs:start:startHandler': this.startHandler.bind(this),
            'before:offline:start:init': this.startHandler.bind(this),
            'before:offline:start:end': this.endHandler.bind(this),
        };
    }
    Object.defineProperty(ServerlessElasticmqLocal.prototype, "port", {
        get: function () {
            var config = (this.service.custom && this.service.custom.sqs) || {};
            var port = _.get(config, 'start.port', 8000);
            return port;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ServerlessElasticmqLocal.prototype, "host", {
        get: function () {
            var config = (this.service.custom && this.service.custom.sqs) || {};
            var host = _.get(config, 'start.host', 'localhost');
            return host;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ServerlessElasticmqLocal.prototype, "stage", {
        /**
         * Get the stage
         *
         * @return {String} the current stage
         */
        get: function () {
            return (this.config && this.config.stage) || (this.service.provider && this.service.provider.stage);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ServerlessElasticmqLocal.prototype, "tables", {
        /**
         * Gets the table definitions
         */
        get: function () {
            var _this = this;
            var stacks = [];
            var defaultStack = this.getDefaultStack();
            if (defaultStack) {
                stacks.push(defaultStack);
            }
            if (this.hasAdditionalStacksPlugin()) {
                stacks = stacks.concat(this.getAdditionalStacks());
            }
            return stacks
                .map(function (stack) { return _this.getTableDefinitionsFromStack(stack); })
                .reduce(function (tables, tablesInStack) { return tables.concat(tablesInStack); }, []);
        },
        enumerable: true,
        configurable: true
    });
    ServerlessElasticmqLocal.prototype.removeHandler = function () {
        return this.sqsLocal.remove();
    };
    ServerlessElasticmqLocal.prototype.installHandler = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.config.verbose) {
                    debug('installHandler', this.options);
                }
                return [2 /*return*/, this.sqsLocal.install(this.options)];
            });
        });
    };
    ServerlessElasticmqLocal.prototype.startHandler = function () {
        if (this.shouldExecute()) {
            var config = (this.service.custom && this.service.custom.sqs) || {};
            var options = _.merge({
                // sharedDb: this.options.sharedDb || true,
                installPath: this.options.installPath,
            }, config && config.start, this.options);
            // otherwise endHandler will be mis-informed
            this.options = options;
            // let dbPath = options.dbPath
            // if (dbPath) {
            //   options.dbPath = path.isAbsolute(dbPath) ? dbPath : path.join(this.serverless.config.servicePath, dbPath)
            // }
            // if (!options.noStart) {
            this.sqsLocal.start();
            // }
            return Promise.resolve();
            // .then(() => options.migrate && this.migrateHandler())
            // .then(() => options.seed && this.seedHandler())
        }
        else {
            this.serverlessLog('Skipping start: SQS Local is not available for stage: ' + this.stage);
        }
    };
    ServerlessElasticmqLocal.prototype.endHandler = function () {
        // if (this.shouldExecute() && !this.options.noStart) {
        if (this.shouldExecute()) {
            this.serverlessLog('SQS - stopping local elasticmq');
            this.sqsLocal.stop();
        }
        else {
            this.serverlessLog('Skipping end: SQS Local is not available for stage: ' + this.stage);
        }
    };
    /**
     * To check if the handler needs to be executed based on stage
     *
     * @return {Boolean} if the handler can run for the provided stage
     */
    ServerlessElasticmqLocal.prototype.shouldExecute = function () {
        if (this.config.stages && this.config.stages.includes(this.stage)) {
            return true;
        }
        return false;
    };
    ServerlessElasticmqLocal.prototype.getDefaultStack = function () {
        return _.get(this.service, 'resources');
    };
    ServerlessElasticmqLocal.prototype.getAdditionalStacks = function () {
        return _.values(_.get(this.service, 'custom.additionalStacks', {}));
    };
    ServerlessElasticmqLocal.prototype.hasAdditionalStacksPlugin = function () {
        return _.get(this.service, 'plugins', []).includes('serverless-plugin-additional-stacks');
    };
    ServerlessElasticmqLocal.prototype.getTableDefinitionsFromStack = function (stack) {
        var resources = _.get(stack, 'Resources', []);
        return Object.keys(resources)
            .map(function (key) {
            if (resources[key].Type === 'AWS::sqs::Table') {
                return resources[key].Properties;
            }
        })
            .filter(function (n) { return n; });
    };
    return ServerlessElasticmqLocal;
}());
exports.default = ServerlessElasticmqLocal;
//# sourceMappingURL=plugin.js.map