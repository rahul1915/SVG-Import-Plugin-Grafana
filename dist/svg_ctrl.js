'use strict';

System.register(['app/plugins/sdk', 'lodash', 'app/core/utils/kbn', 'app/core/time_series', './rendering', './demos', './node_modules/snapsvg/dist/snap.svg-min.js', './node_modules/brace/index.js', './node_modules/brace/ext/language_tools.js', './node_modules/brace/theme/tomorrow_night_bright.js', './node_modules/brace/mode/javascript.js', './node_modules/brace/mode/svg.js'], function (_export, _context) {
    "use strict";

    var MetricsPanelCtrl, _, kbn, TimeSeries, rendering, SVGDemos, Snap, ace, _typeof, _createClass, GrafanaJSCompleter, SVGCtrl;

    function _possibleConstructorReturn(self, call) {
        if (!self) {
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }

        return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }

    function _inherits(subClass, superClass) {
        if (typeof superClass !== "function" && superClass !== null) {
            throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
        }

        subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    return {
        setters: [function (_appPluginsSdk) {
            MetricsPanelCtrl = _appPluginsSdk.MetricsPanelCtrl;
        }, function (_lodash) {
            _ = _lodash.default;
        }, function (_appCoreUtilsKbn) {
            kbn = _appCoreUtilsKbn.default;
        }, function (_appCoreTime_series) {
            TimeSeries = _appCoreTime_series.default;
        }, function (_rendering) {
            rendering = _rendering.default;
        }, function (_demos) {
            SVGDemos = _demos.SVGDemos;
        }, function (_node_modulesSnapsvgDistSnapSvgMinJs) {
            Snap = _node_modulesSnapsvgDistSnapSvgMinJs.Snap;
        }, function (_node_modulesBraceIndexJs) {
            ace = _node_modulesBraceIndexJs.default;
        }, function (_node_modulesBraceExtLanguage_toolsJs) {}, function (_node_modulesBraceThemeTomorrow_night_brightJs) {}, function (_node_modulesBraceModeJavascriptJs) {}, function (_node_modulesBraceModeSvgJs) {}],
        execute: function () {
            _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
                return typeof obj;
            } : function (obj) {
                return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
            };

            _createClass = function () {
                function defineProperties(target, props) {
                    for (var i = 0; i < props.length; i++) {
                        var descriptor = props[i];
                        descriptor.enumerable = descriptor.enumerable || false;
                        descriptor.configurable = true;
                        if ("value" in descriptor) descriptor.writable = true;
                        Object.defineProperty(target, descriptor.key, descriptor);
                    }
                }

                return function (Constructor, protoProps, staticProps) {
                    if (protoProps) defineProperties(Constructor.prototype, protoProps);
                    if (staticProps) defineProperties(Constructor, staticProps);
                    return Constructor;
                };
            }();

            GrafanaJSCompleter = function () {
                function GrafanaJSCompleter($lang_tools, $control, $panel) {
                    _classCallCheck(this, GrafanaJSCompleter);

                    this.$lang_tools = $lang_tools;
                    this.$control = $control;
                    this.$panel = $panel;
                }

                _createClass(GrafanaJSCompleter, [{
                    key: 'getCompletions',
                    value: function getCompletions(editor, session, pos, prefix, callback) {
                        var pos = editor.getCursorPosition();
                        var line = editor.session.getLine(pos.row);

                        prefix = line.substring(0, pos.column).match(/this\.\S*/g);
                        if (prefix) {
                            prefix = prefix[prefix.length - 1];
                            prefix = prefix.substring(0, prefix.lastIndexOf('.'));

                            var panelthis = this.$panel;
                            var evalObj = eval('panel' + prefix);
                            this.evaluatePrefix(evalObj, callback);
                            return;
                        }

                        prefix = line.substring(0, pos.column).match(/ctrl\.\S*/g);
                        if (prefix) {
                            prefix = prefix[prefix.length - 1];
                            prefix = prefix.substring(0, prefix.lastIndexOf('.'));

                            var ctrl = this.$control;
                            var evalObj = eval(prefix);
                            this.evaluatePrefix(evalObj, callback);
                            return;
                        }

                        prefix = line.substring(0, pos.column).match(/svgnode\.\S*/g);
                        if (prefix) {
                            prefix = prefix[prefix.length - 1];
                            prefix = prefix.substring(0, prefix.lastIndexOf('.'));

                            var svgnode = document.querySelector('.svg-object');
                            var evalObj = eval(prefix);
                            this.evaluatePrefix(evalObj, callback);
                            return;
                        }

                        if (prefix == '') {
                            var wordList = ['ctrl', 'svgnode', 'this'];

                            callback(null, wordList.map(function (word) {
                                return {
                                    caption: word,
                                    value: word,
                                    meta: 'Grafana keyword'
                                };
                            }));
                        }
                    }
                }, {
                    key: 'evaluatePrefix',
                    value: function evaluatePrefix(evalObj, callback) {
                        var wordList = [];
                        for (var key in evalObj) {
                            wordList.push(key);
                        }
                        callback(null, wordList.map(function (word) {
                            return {
                                caption: word + ': ' + (Array.isArray(evalObj[word]) ? 'Array[' + (evalObj[word] || []).length + ']' : _typeof(evalObj[word])),
                                value: word,
                                meta: "Grafana keyword"
                            };
                        }));
                        return;
                    }
                }]);

                return GrafanaJSCompleter;
            }();

            _export('SVGCtrl', SVGCtrl = function (_MetricsPanelCtrl) {
                _inherits(SVGCtrl, _MetricsPanelCtrl);

                function SVGCtrl($scope, $injector, $rootScope) {
                    _classCallCheck(this, SVGCtrl);

                    var _this = _possibleConstructorReturn(this, (SVGCtrl.__proto__ || Object.getPrototypeOf(SVGCtrl)).call(this, $scope, $injector));

                    _this.$rootScope = $rootScope;

                    var panelDefaults = {
                        links: [],
                        datasource: null,
                        maxDataPoints: 3,
                        interval: null,
                        targets: [{}],
                        cacheTimeout: null,
                        nullPointMode: 'connected',
                        aliasColors: {},
                        format: 'short',
                        svgImportConfig: [],
                        statsList: [],

                        svg_data: '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 1000 1000" ></svg>',
                        js_code: '',
                        js_init_code: '',
                        useSVGBuilder: false,
                        colorcodes: "#32CD32,#FFC200,#FF0000",
                        svgBuilderData: {
                            width: '100%',
                            height: '100%',
                            viewport: {
                                x: 0,
                                y: 0,
                                width: 1000,
                                height: 1000
                            },
                            elements: []
                        }
                    };

                    _.defaults(_this.panel, panelDefaults);

                    _this.events.on('render', _this.onRender.bind(_this));
                    _this.events.on('refresh', _this.onRender.bind(_this));
                    _this.events.on('data-received', _this.onDataReceived.bind(_this));
                    _this.events.on('data-error', _this.onDataError.bind(_this));
                    _this.events.on('data-snapshot-load', _this.onDataReceived.bind(_this));
                    _this.events.on('init-edit-mode', _this.onInitEditMode.bind(_this));

                    _this.demos = new SVGDemos(_this);
                    _this.initialized = 0;
                    _this.editors = {};
                    return _this;
                }

                _createClass(SVGCtrl, [{
                    key: 'onInitEditMode',
                    value: function onInitEditMode() {
                        this.addEditorTab('SVG Builder', 'public/plugins/marcuscalidus-svg-panel/editor_builder.html', 2);
                        this.addEditorTab('SVG', 'public/plugins/marcuscalidus-svg-panel/editor_svg.html', 3);
                        this.addEditorTab('Events', 'public/plugins/marcuscalidus-svg-panel/editor_events.html', 4);
                        this.prepareEditor();
                        this.unitFormats = kbn.getUnitFormats();
                        this.aceLangTools = ace.acequire("ace/ext/language_tools");

                        this.aceLangTools.addCompleter(new GrafanaJSCompleter(this.aceLangTools, this, this.panel));
                    }
                }, {
                    key: 'doShowAceJs',
                    value: function doShowAceJs(nodeId) {
                        setTimeout(function () {
                            if ($('#' + nodeId).length === 1) {
                                this.editors[nodeId] = ace.edit(nodeId);
                                $('#' + nodeId).attr('id', nodeId + '_initialized');
                                this.editors[nodeId].setValue(this.panel[nodeId], 1);
                                this.editors[nodeId].getSession().on('change', function () {
                                    var val = this.editors[nodeId].getSession().getValue();
                                    this.panel[nodeId] = val;
                                    try {
                                        this.setInitFunction();
                                        this.setHandleMetricFunction();
                                        this.render();
                                    } catch (err) {
                                        console.error(err);
                                    }
                                }.bind(this));
                                this.editors[nodeId].setOptions({
                                    enableBasicAutocompletion: true,
                                    enableLiveAutocompletion: true,
                                    theme: 'ace/theme/tomorrow_night_bright',
                                    mode: 'ace/mode/javascript',
                                    showPrintMargin: false
                                });
                            }
                        }.bind(this), 100);
                        return true;
                    }
                }, {
                    key: 'doShowAceSvg',
                    value: function doShowAceSvg(nodeId) {
                        setTimeout(function () {
                            if ($('#' + nodeId).length === 1) {
                                this.editors[nodeId] = ace.edit(nodeId);
                                $('#' + nodeId).attr('id', nodeId + '_initialized');
                                this.editors[nodeId].setValue(this.panel[nodeId], 1);
                                this.editors[nodeId].getSession().on('change', function () {
                                    var val = this.editors[nodeId].getSession().getValue();
                                    this.panel[nodeId] = val;
                                    try {
                                        this.resetSVG();
                                        this.render();
                                    } catch (err) {
                                        console.error(err);
                                    }
                                }.bind(this));
                                this.editors[nodeId].setOptions({
                                    enableBasicAutocompletion: true,
                                    enableLiveAutocompletion: true,
                                    readOnly: this.panel.useSVGBuilder,
                                    theme: 'ace/theme/tomorrow_night_bright',
                                    mode: 'ace/mode/svg',
                                    showPrintMargin: false
                                });
                            }
                        }.bind(this), 100);
                        return true;
                    }
                }, {
                    key: 'setUnitFormat',
                    value: function setUnitFormat(subItem) {
                        this.panel.format = subItem.value;
                        this.render();
                    }
                }, {
                    key: 'onDataError',
                    value: function onDataError() {
                        this.series = [];
                        this.render();
                    }
                }, {
                    key: 'changeSeriesColor',
                    value: function changeSeriesColor(series, color) {
                        series.color = color;
                        this.panel.aliasColors[series.alias] = series.color;
                        this.render();
                    }
                }, {
                    key: 'setHandleMetricFunction',
                    value: function setHandleMetricFunction() {
                        this.panel.handleMetric = Function('ctrl', 'svgnode', this.panel.js_code);
                    }
                }, {
                    key: 'setInitFunction',
                    value: function setInitFunction() {
                        this.initialized = 0;
                        this.panel.doInit = Function('ctrl', 'svgnode', this.panel.js_init_code);
                    }
                }, {
                    key: 'onRender',
                    value: function onRender() {
                        if (!_.isFunction(this.panel.handleMetric)) {
                            this.setHandleMetricFunction();
                        }

                        if (!_.isFunction(this.panel.doInit)) {
                            this.setInitFunction();
                        }
                    }
                }, {
                    key: 'onDataReceived',
                    value: function onDataReceived(dataList) {

                        this.tables = [];
                        this.series = [];

                        if (dataList.length > 0 && dataList[0].type === 'table') {
                            this.tables = dataList.map(this.tableHandler.bind(this));
                        } else {
                            this.series = dataList.map(this.seriesHandler.bind(this));
                        }

                        this.render();
                    }
                }, {
                    key: 'resetSVG',
                    value: function resetSVG() {
                        this.initialized = 0;
                        this.panel.metricList;
                        this.panel.js_code;
                    }
                }, {
                    key: 'seriesHandler',
                    value: function seriesHandler(seriesData) {
                        var series = new TimeSeries({
                            datapoints: seriesData.datapoints,
                            alias: seriesData.target
                        });

                        series.flotpairs = series.getFlotPairs(this.panel.nullPointMode);
                        return series;
                    }
                }, {
                    key: 'tableHandler',
                    value: function tableHandler(tableData) {

                        var columnNames = tableData.columns.map(function (column) {
                            return column.text;
                        });

                        var rows = tableData.rows.map(function (row) {
                            var datapoint = {};

                            row.forEach(function (value, columnIndex) {
                                var key = columnNames[columnIndex];
                                datapoint[key] = value;
                            });

                            return datapoint;
                        });

                        return { columnNames: columnNames, rows: rows };
                    }
                }, {
                    key: 'getSeriesIdByAlias',
                    value: function getSeriesIdByAlias(aliasName) {
                        for (var i = 0; i < this.series.length; i++) {
                            if (this.series[i].alias == aliasName) {
                                return i;
                            }
                        }
                        return -1;
                    }
                }, {
                    key: 'getSeriesElementByAlias',
                    value: function getSeriesElementByAlias(aliasName) {
                        var i = this.getSeriesIdByAlias(aliasName);
                        if (i >= 0) {
                            return this.series[i];
                        }
                        return null;
                    }
                }, {
                    key: 'getDecimalsForValue',
                    value: function getDecimalsForValue(value) {
                        if (_.isNumber(this.panel.decimals)) {
                            return { decimals: this.panel.decimals, scaledDecimals: null };
                        }

                        var delta = value / 2;
                        var dec = -Math.floor(Math.log(delta) / Math.LN10);

                        var magn = Math.pow(10, -dec);
                        var norm = delta / magn; // norm is between 1.0 and 10.0
                        var size;

                        if (norm < 1.5) {
                            size = 1;
                        } else if (norm < 3) {
                            size = 2;
                            // special case for 2.5, requires an extra decimal
                            if (norm > 2.25) {
                                size = 2.5;
                                ++dec;
                            }
                        } else if (norm < 7.5) {
                            size = 5;
                        } else {
                            size = 10;
                        }

                        size *= magn;

                        // reduce starting decimals if not needed
                        if (Math.floor(value) === value) {
                            dec = 0;
                        }

                        var result = {};
                        result.decimals = Math.max(0, dec);
                        result.scaledDecimals = result.decimals - Math.floor(Math.log(size) / Math.LN10) + 2;

                        return result;
                    }
                }, {
                    key: 'formatValue',
                    value: function formatValue(value) {
                        var decimalInfo = this.getDecimalsForValue(value);
                        var formatFunc = kbn.valueFormats[this.panel.format];
                        if (formatFunc) {
                            return formatFunc(value, decimalInfo.decimals, decimalInfo.scaledDecimals);
                        }
                        return value;
                    }
                }, {
                    key: 'link',
                    value: function link(scope, elem, attrs, ctrl) {
                        rendering(scope, elem, attrs, ctrl);
                    }
                }, {
                    key: 'removeElement',
                    value: function removeElement(idx) {
                        this.panel.svgBuilderData.elements.splice(idx, 1);
                        this.buildSVG();
                    }
                }, {
                    key: 'moveElement',
                    value: function moveElement(idx, steps) {
                        this.panel.svgBuilderData.elements = _.move(this.panel.svgBuilderData.elements, idx, idx + steps);
                        this.buildSVG();
                    }
                }, {
                    key: 'prepareEditor',
                    value: function prepareEditor() {
                        var _this2 = this;

                        var request = new XMLHttpRequest();

                        request.open("GET", "public/plugins/marcuscalidus-svg-panel/assets/repositories.json");
                        request.addEventListener('load', function (event) {
                            if (request.status >= 200 && request.status < 300) {
                                _this2.panel.repositories = JSON.parse(request.responseText);
                            } else {
                                console.warn(request.statusText, request.responseText);
                            }
                        });
                        request.send();
                    }
                }, {
                    key: 'repositorySelected',
                    value: function repositorySelected() {
                        var newCategories = [];
                        this.panel.selectedSVG = null;

                        if (this.panel.repositories[this.panel.selectedRepository]) {
                            _.forEach(this.panel.repositories[this.panel.selectedRepository].items, function (item) {
                                if (!_.includes(newCategories, item.category)) {
                                    newCategories.push(item.category);
                                }
                            });
                        }

                        this.panel.categories = newCategories;
                    }
                }, {
                    key: 'categorySelected',
                    value: function categorySelected() {
                        var _this3 = this;

                        this.panel.svglist = [];
                        this.panel.selectedSVG = null;

                        if (this.panel.repositories[this.panel.selectedRepository]) {
                            this.panel.svglist = _.filter(this.panel.repositories[this.panel.selectedRepository].items, function (item) {
                                return item.category === _this3.panel.selectedCategory;
                            });
                        }
                    }
                }, {
                    key: 'addSVGItem',
                    value: function addSVGItem() {
                        var svg = JSON.parse(this.panel.selectedSVG);

                        this.panel.svgBuilderData.elements.push({
                            name: svg.name,
                            id: svg.name,
                            path: svg.path,
                            x: 0,
                            y: 0,
                            rotate: 0,
                            rcenterx: 0,
                            rcentery: 0,
                            scale: 1
                        });
                        this.buildSVG();
                    }
                }, {
                    key: 'buildSVG',
                    value: function buildSVG() {
                        var _this4 = this;

                        var all = function all(array) {
                            var deferred = $.Deferred();
                            var fulfilled = 0,
                                length = array.length;
                            var results = [];

                            if (length === 0) {
                                deferred.resolve(results);
                            } else {
                                array.forEach(function (promise, i) {
                                    $.when(promise()).then(function (value) {
                                        results[i] = value;
                                        fulfilled++;
                                        if (fulfilled === length) {
                                            deferred.resolve(results);
                                        }
                                    });
                                });
                            }

                            return deferred.promise();
                        };

                        var panel = this.panel;
                        if (panel.useSVGBuilder) {
                            var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                            var svgNS = svg.namespaceURI;

                            svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                            svg.setAttribute('width', panel.svgBuilderData.width);
                            svg.setAttribute('height', panel.svgBuilderData.height);
                            svg.setAttribute('viewBox', panel.svgBuilderData.viewport.x + ' ' + panel.svgBuilderData.viewport.y + ' ' + panel.svgBuilderData.viewport.width + ' ' + panel.svgBuilderData.viewport.height);

                            var promises = [];

                            panel.svgBuilderData.elements.forEach(function (element) {
                                promises.push(function () {
                                    return $.Deferred(function (dfd) {
                                        $.get('public/plugins/marcuscalidus-svg-panel/assets/' + element.path, function (data) {
                                            dfd.resolve(data);
                                        });
                                    }).promise();
                                });
                            });

                            $.when(all(promises)).then(function (results) {
                                results.forEach(function (svgFragment, i) {
                                    var g = document.createElementNS(svgNS, 'g');
                                    g.setAttribute('id', panel.svgBuilderData.elements[i].id);
                                    g.setAttribute('transform', 'translate(' + panel.svgBuilderData.elements[i].x + ' ' + panel.svgBuilderData.elements[i].y + ') ' + 'rotate(' + panel.svgBuilderData.elements[i].rotate + ' ' + panel.svgBuilderData.elements[i].rcenterx + ' ' + panel.svgBuilderData.elements[i].rcentery + ') ' + 'scale(' + panel.svgBuilderData.elements[i].scale + ')');
                                    svg.appendChild(g);
                                    $(g).html(svgFragment.documentElement.children);
                                });
                                panel.svg_data = svg.outerHTML;
                                _this4.resetSVG();
                                _this4.render();
                            });
                        }
                    }
                }, {
                    key: 'onChooseFile',
                    value: function onChooseFile() {
                        this.panel.svgImportConfig = [];
                        var panel = this.panel;
                        var file = document.getElementById('file').files[0];
                        panel.fileName = file.name;
                        panel.idList = [];
                        panel.valueList = [];
                        panel.js_code = "";
                        panel.selectedID = null;
                        panel.selectedValue = null;
                        panel.metricList = this.series;
                        panel.statsList = [{ "name": "Current", "value": "current" }, { "name": "Average", "value": "avg" }, { "name": "Max", "value": "max" }, { "name": "Min", "value": "min" }, { "name": "Total", "value": "total" }];
                        panel.selectedStats = "total";
                        if (this.series.length != 0) {
                            panel.selectedMetric = this.series[0].alias;
                        }
                        var idList = [];
                        var valueList = [];
                        var fr = new FileReader();
                        fr.onload = onFileLoad;
                        function onFileLoad(e) {
                            panel.svg_data = e.target.result;
                            var elementList = document.getElementsByTagName("text");
                            for (var i in elementList) {
                                if (elementList[i].id) {
                                    idList.push(elementList[i].id);
                                }
                                if (elementList[i].innerHTML != undefined && elementList[i].innerHTML.trim() != "") {
                                    if (elementList[i].innerHTML != "[Not supported by viewer]") {
                                        valueList.push(elementList[i].innerHTML);
                                    } else {
                                        var elm = elementList[i].previousElementSibling;
                                        if (elm.tagName === "foreignObject") {
                                            while (elm.firstElementChild) {
                                                elm = elm.firstElementChild;
                                            }
                                            valueList.push(elm.innerHTML.trim());
                                        }
                                    }
                                }
                            }
                        }
                        fr.readAsText(file);
                        var currentObj = this;
                        setTimeout(function () {
                            panel.idList = idList;
                            panel.valueList = valueList;
                            panel.selectedValue = valueList[0];
                            panel.selectedID = idList[0];
                            currentObj.resetSVG();
                            currentObj.render();
                        }, 100);
                        this.panel.js_code = "";
                        this.setHandleMetricFunction();
                        this.resetSVG();
                        this.render();
                    }
                }, {
                    key: 'addMetricValueWithSVG',
                    value: function addMetricValueWithSVG(value, metricAlias, threshold, colorcodes, showValue, statsValue) {
                        var thFlag = true;
                        var minth, maxth, lth, mth, rth;
                        var stats = statsValue;
                        if (threshold != undefined && threshold != "") {
                            minth = threshold.split(",")[0];
                            maxth = threshold.split(",")[1];
                            lth = colorcodes.split(",")[0];
                            mth = colorcodes.split(",")[1];
                            rth = colorcodes.split(",")[2];
                        } else {
                            thFlag = false;
                        }
                        var component = null;
                        var metricValue = null;
                        var index = -1;
                        var thresholdBlock = "";
                        var htmlObject = document.createElement('div');
                        htmlObject.innerHTML = this.panel.svg_data;
                        for (var i in this.panel.metricList) {
                            if (this.panel.metricList[i].alias == metricAlias) {
                                metricValue = this.panel.metricList[i].stats.total;
                                index = i;
                                break;
                            }
                        }
                        var elementList = htmlObject.getElementsByTagName("foreignObject");
                        if (elementList.length == 0) {
                            elementList = htmlObject.getElementsByTagName("text");
                        }
                        for (var i in elementList) {
                            component = elementList[i];
                            while (component.firstElementChild) {
                                component = component.firstElementChild;
                            }
                            if (component.innerHTML.trim() === value) {
                                component.setAttribute('id', value + '_1');
                                break;
                            }
                        }
                        var elementTagName = component.closest("g").previousElementSibling.tagName;
                        this.panel.svg_data = htmlObject.innerHTML;
                        this.panel.js_code = this.panel.js_code + 'document.getElementById("' + (value + '_1') + '").innerHTML' + '= Math.round(ctrl.series[' + index + '].stats.' + stats + ');';
                        if (thFlag) {
                            if (!showValue) {
                                this.panel.js_code = this.panel.js_code + 'document.getElementById("' + (value + '_1') + '").style = "display:none;text-align:inherit;text-decoration:inherit;";';
                            }
                            if (elementTagName != "path") {
                                thresholdBlock = 'if(' + minth + '> Math.round(ctrl.series[' + index + '].stats.' + stats + ')){' + 'document.getElementById("' + (value + '_1') + '").closest("g").previousElementSibling.setAttribute("fill","' + lth + '");' + '}else if(' + minth + '<= Math.round(ctrl.series[' + index + '].stats.' + stats + ') && Math.round(ctrl.series[' + index + '].stats.' + stats + ') <=' + maxth + ') {' + 'document.getElementById("' + (value + '_1') + '").closest("g").previousElementSibling.setAttribute("fill","' + mth + '");' + '}else if(Math.round(ctrl.series[' + index + '].stats.' + stats + ') >' + maxth + ') {' + 'document.getElementById("' + (value + '_1') + '").closest("g").previousElementSibling.setAttribute("fill","' + rth + '");' + '}';
                            } else {
                                thresholdBlock = 'var pathComp = document.getElementById("' + (value + '_1') + '").closest("g").previousElementSibling;if(' + minth + '> Math.round(ctrl.series[' + index + '].stats.' + stats + ')){' + 'while(pathComp.tagName == "path"){' + 'pathComp.setAttribute("fill","' + lth + '");' + 'pathComp.setAttribute("stroke","' + lth + '");' + 'pathComp = pathComp.previousElementSibling;}' + '}else if(' + minth + '<= Math.round(ctrl.series[' + index + '].stats.' + stats + ') && Math.round(ctrl.series[' + index + '].stats.' + stats + ') <=' + maxth + ') {' + 'while(pathComp.tagName == "path"){' + 'pathComp.setAttribute("fill","' + mth + '");' + 'pathComp.setAttribute("stroke","' + mth + '");' + 'pathComp = pathComp.previousElementSibling;}' + '}else if(Math.round(ctrl.series[' + index + '].stats.' + stats + ') >' + maxth + ') {' + 'while(pathComp.tagName == "path"){' + 'pathComp.setAttribute("fill","' + rth + '");' + 'pathComp.setAttribute("stroke","' + rth + '");' + 'pathComp = pathComp.previousElementSibling;}' + '}';
                            }
                            this.panel.js_code = this.panel.js_code + thresholdBlock;
                        }
                        var importConf = {
                            id: value + '_1',
                            metric: metricAlias,
                            threshold: threshold,
                            colorCode: threshold != '' ? colorcodes : '',
                            component: value,
                            label: showValue,
                            stats: stats
                        };
                        this.panel.svgImportConfig.push(importConf);
                        this.setHandleMetricFunction();
                        this.resetSVG();
                        this.render();
                    }
                }, {
                    key: 'editImportedSVG',
                    value: function editImportedSVG(elem) {
                        for (var i = 0; i < this.panel.svgImportConfig.length; i++) {
                            if (this.panel.svgImportConfig[i].id == elem.id) {
                                this.panel.svgImportConfig[i] = elem;
                            }
                        }
                        this.updateSVGConfiguration(this.panel.svgImportConfig);
                    }
                }, {
                    key: 'removeImportedSVG',
                    value: function removeImportedSVG(elem) {
                        for (var i = 0; i < this.panel.svgImportConfig.length; i++) {
                            if (this.panel.svgImportConfig[i].id == elem.id) {
                                this.panel.svgImportConfig.splice(i, 1);
                            }
                        }
                        this.updateSVGConfiguration(this.panel.svgImportConfig);
                    }
                }, {
                    key: 'updateSVGConfiguration',
                    value: function updateSVGConfiguration(list) {
                        this.panel.js_code = "";
                        for (var j = 0; j < list.length; j++) {
                            var value = list[j].component;
                            var threshold = list[j].threshold;
                            var colorcodes = list[j].colorCode;
                            var metricAlias = list[j].metric;
                            var label = list[j].label;
                            var stats = list[j].stats;
                            var thFlag = true;
                            var minth, maxth, lth, mth, rth;
                            if (threshold != undefined && threshold != "") {
                                minth = threshold.split(",")[0];
                                maxth = threshold.split(",")[1];
                                lth = colorcodes.split(",")[0];
                                mth = colorcodes.split(",")[1];
                                rth = colorcodes.split(",")[2];
                            } else {
                                thFlag = false;
                            }
                            var metricValue = null;
                            var index = -1;
                            var thresholdBlock = "";
                            for (var i in this.panel.metricList) {
                                if (this.panel.metricList[i].alias == metricAlias) {
                                    metricValue = this.panel.metricList[i].stats.total;
                                    index = i;
                                    break;
                                }
                            }
                            var elementTagName = document.getElementById(value + '_1').closest("g").previousElementSibling.tagName;
                            this.panel.js_code = this.panel.js_code + 'document.getElementById("' + (value + '_1') + '").innerHTML' + '= Math.round(ctrl.series[' + index + '].stats.' + stats + ');';
                            if (thFlag) {
                                if (!label) {
                                    this.panel.js_code = this.panel.js_code + 'document.getElementById("' + (value + '_1') + '").style = "display:none;text-align:inherit;text-decoration:inherit;";';
                                }
                                if (elementTagName != "path") {
                                    thresholdBlock = 'if(' + minth + '> Math.round(ctrl.series[' + index + '].stats.' + stats + ')){' + 'document.getElementById("' + (value + '_1') + '").closest("g").previousElementSibling.setAttribute("fill","' + lth + '");' + '}else if(' + minth + '<= Math.round(ctrl.series[' + index + '].stats.' + stats + ') && Math.round(ctrl.series[' + index + '].stats.' + stats + ') <=' + maxth + ') {' + 'document.getElementById("' + (value + '_1') + '").closest("g").previousElementSibling.setAttribute("fill","' + mth + '");' + '}else if(Math.round(ctrl.series[' + index + '].stats.' + stats + ') >' + maxth + ') {' + 'document.getElementById("' + (value + '_1') + '").closest("g").previousElementSibling.setAttribute("fill","' + rth + '");' + '}';
                                } else {
                                    thresholdBlock = 'var pathComp = document.getElementById("' + (value + '_1') + '").closest("g").previousElementSibling;if(' + minth + '> Math.round(ctrl.series[' + index + '].stats.' + stats + ')){' + 'while(pathComp.tagName == "path"){' + 'pathComp.setAttribute("fill","' + lth + '");' + 'pathComp.setAttribute("stroke","' + lth + '");' + 'pathComp = pathComp.previousElementSibling;}' + '}else if(' + minth + '<= Math.round(ctrl.series[' + index + '].stats.' + stats + ') && Math.round(ctrl.series[' + index + '].stats.' + stats + ') <=' + maxth + ') {' + 'while(pathComp.tagName == "path"){' + 'pathComp.setAttribute("fill","' + mth + '");' + 'pathComp.setAttribute("stroke","' + mth + '");' + 'pathComp = pathComp.previousElementSibling;}' + '}else if(Math.round(ctrl.series[' + index + '].stats.' + stats + ') >' + maxth + ') {' + 'while(pathComp.tagName == "path"){' + 'pathComp.setAttribute("fill","' + rth + '");' + 'pathComp.setAttribute("stroke","' + rth + '");' + 'pathComp = pathComp.previousElementSibling;}' + '}';
                                }
                                this.panel.js_code = this.panel.js_code + thresholdBlock;
                            }
                        }
                        this.setHandleMetricFunction();
                        this.resetSVG();
                        this.render();
                    }
                }, {
                    key: 'metricSelected',
                    value: function metricSelected(metric) {
                        console.log(metric);
                    }
                }, {
                    key: 'statSelected',
                    value: function statSelected(stat) {
                        console.log(stat);
                    }
                }, {
                    key: 'valueSelected',
                    value: function valueSelected(val) {
                        console.log(val);
                    }
                }, {
                    key: 'refreshMetric',
                    value: function refreshMetric() {
                        this.panel.metricList = this.series;
                        var currObj = this;
                        setTimeout(function () {
                            currObj.panel.selectedMetric = currObj.series[0].alias;
                            currObj.panel.selectedStats = "total";
                        }, 25);
                    }
                }]);

                return SVGCtrl;
            }(MetricsPanelCtrl));

            _export('SVGCtrl', SVGCtrl);

            SVGCtrl.templateUrl = 'module.html';
        }
    };
});
//# sourceMappingURL=svg_ctrl.js.map
