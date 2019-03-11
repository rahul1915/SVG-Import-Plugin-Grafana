import { MetricsPanelCtrl } from 'app/plugins/sdk';
import _ from 'lodash';
import kbn from 'app/core/utils/kbn';
import TimeSeries from 'app/core/time_series';
import rendering from './rendering';
import { SVGDemos } from './demos';
import { Snap } from './node_modules/snapsvg/dist/snap.svg-min.js';
import ace from './node_modules/brace/index.js';
import './node_modules/brace/ext/language_tools.js';
import './node_modules/brace/theme/tomorrow_night_bright.js';
import './node_modules/brace/mode/javascript.js';
import './node_modules/brace/mode/svg.js';

class GrafanaJSCompleter {
    constructor($lang_tools, $control, $panel) {
        this.$lang_tools = $lang_tools;
        this.$control = $control;
        this.$panel = $panel;
    }

    getCompletions(editor, session, pos, prefix, callback) {
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

            callback(null, wordList.map(function(word) {
                return {
                    caption: word,
                    value: word,
                    meta: 'Grafana keyword'
                };
            }));
        }
    }

    evaluatePrefix(evalObj, callback) {
        var wordList = [];
        for (var key in evalObj) {
            wordList.push(key);
        }
        callback(null, wordList.map(function(word) {
            return {
                caption: word + ': ' + (Array.isArray(evalObj[word]) ? 'Array[' + (evalObj[word] || []).length + ']' : typeof evalObj[word]),
                value: word,
                meta: "Grafana keyword"
            };
        }));
        return;
    }
}


export class SVGCtrl extends MetricsPanelCtrl {

    constructor($scope, $injector, $rootScope) {
        super($scope, $injector);
        this.$rootScope = $rootScope;

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
            svgImportConfig : [],
            statsList : [],

            svg_data: '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 1000 1000" ></svg>',
            js_code: '',
            js_init_code: '',
            useSVGBuilder: false,
            colorcodes : "#32CD32,#FFC200,#FF0000",
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

        _.defaults(this.panel, panelDefaults);

        this.events.on('render', this.onRender.bind(this));
        this.events.on('refresh', this.onRender.bind(this));
        this.events.on('data-received', this.onDataReceived.bind(this));
        this.events.on('data-error', this.onDataError.bind(this));
        this.events.on('data-snapshot-load', this.onDataReceived.bind(this));
        this.events.on('init-edit-mode', this.onInitEditMode.bind(this));

        this.demos = new SVGDemos(this);
        this.initialized = 0;
        this.editors = {};
    }

    onInitEditMode() {
        this.addEditorTab('SVG Builder', 'public/plugins/marcuscalidus-svg-panel/editor_builder.html', 2);
        this.addEditorTab('SVG', 'public/plugins/marcuscalidus-svg-panel/editor_svg.html', 3);
        this.addEditorTab('Events', 'public/plugins/marcuscalidus-svg-panel/editor_events.html', 4);
        this.prepareEditor();
        this.unitFormats = kbn.getUnitFormats();
        this.aceLangTools = ace.acequire("ace/ext/language_tools");

        this.aceLangTools.addCompleter(new GrafanaJSCompleter(this.aceLangTools, this, this.panel));
    }

    doShowAceJs(nodeId) {
        setTimeout(function() {
            if ($('#' + nodeId).length === 1) {
                this.editors[nodeId] = ace.edit(nodeId);
                $('#' + nodeId).attr('id', nodeId + '_initialized');
                this.editors[nodeId].setValue(this.panel[nodeId], 1);
                this.editors[nodeId].getSession().on('change', function() {
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

    doShowAceSvg(nodeId) {
        setTimeout(function() {
            if ($('#' + nodeId).length === 1) {
                this.editors[nodeId] = ace.edit(nodeId);
                $('#' + nodeId).attr('id', nodeId + '_initialized');
                this.editors[nodeId].setValue(this.panel[nodeId], 1);
                this.editors[nodeId].getSession().on('change', function() {
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

    setUnitFormat(subItem) {
        this.panel.format = subItem.value;
        this.render();
    }

    onDataError() {
        this.series = [];
        this.render();
    }

    changeSeriesColor(series, color) {
        series.color = color;
        this.panel.aliasColors[series.alias] = series.color;
        this.render();
    }

    setHandleMetricFunction() {
        this.panel.handleMetric = Function('ctrl', 'svgnode', this.panel.js_code);
    }

    setInitFunction() {
        this.initialized = 0;
        this.panel.doInit = Function('ctrl', 'svgnode', this.panel.js_init_code);
    }

    onRender() {
        if (!_.isFunction(this.panel.handleMetric)) {
            this.setHandleMetricFunction();
        }

        if (!_.isFunction(this.panel.doInit)) {
            this.setInitFunction();
        }
    }

    onDataReceived(dataList) {
		
		this.tables = [];
		this.series = [];
		
		if (dataList.length > 0 && dataList[0].type === 'table') {
		  this.tables = dataList.map(this.tableHandler.bind(this));
		} else {
		  this.series = dataList.map(this.seriesHandler.bind(this));
		}

        this.render();
    }

    resetSVG() {
        this.initialized = 0;
        this.panel.metricList;
        this.panel.js_code;
    }

    seriesHandler(seriesData) {
        var series = new TimeSeries({
            datapoints: seriesData.datapoints,
            alias: seriesData.target
        });

        series.flotpairs = series.getFlotPairs(this.panel.nullPointMode);
        return series;
    }
	
	tableHandler(tableData) {
		
		const columnNames = tableData.columns.map(column => column.text);

		const rows = tableData.rows.map(row => {
		  const datapoint = {};

		  row.forEach((value, columnIndex) => {
			const key = columnNames[columnIndex];
			datapoint[key] = value;
		  });

		  return datapoint;
		});

		return { columnNames: columnNames, rows: rows };
	}

    getSeriesIdByAlias(aliasName) {
        for (var i = 0; i < this.series.length; i++) {
            if (this.series[i].alias == aliasName) {
                return i;
            }
        }
        return -1;
    }

    getSeriesElementByAlias(aliasName) {
        var i = this.getSeriesIdByAlias(aliasName);
        if (i >= 0) {
            return this.series[i];
        }
        return null;
    }

    getDecimalsForValue(value) {
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
        if (Math.floor(value) === value) { dec = 0; }

        var result = {};
        result.decimals = Math.max(0, dec);
        result.scaledDecimals = result.decimals - Math.floor(Math.log(size) / Math.LN10) + 2;

        return result;
    }

    formatValue(value) {
        var decimalInfo = this.getDecimalsForValue(value);
        var formatFunc = kbn.valueFormats[this.panel.format];
        if (formatFunc) {
            return formatFunc(value, decimalInfo.decimals, decimalInfo.scaledDecimals);
        }
        return value;
    }

    link(scope, elem, attrs, ctrl) {
        rendering(scope, elem, attrs, ctrl);
    }

    removeElement(idx) {
        this.panel.svgBuilderData.elements.splice(idx, 1);
        this.buildSVG();
    }

    moveElement(idx, steps) {
        this.panel.svgBuilderData.elements = _.move(this.panel.svgBuilderData.elements, idx, idx + steps);
        this.buildSVG();
    }

    prepareEditor() {
        var request = new XMLHttpRequest();

        request.open("GET", "public/plugins/marcuscalidus-svg-panel/assets/repositories.json");
        request.addEventListener('load', (event) => {
            if (request.status >= 200 && request.status < 300) {
                this.panel.repositories = JSON.parse(request.responseText);
            } else {
                console.warn(request.statusText, request.responseText);
            }
        });
        request.send();
    }

    repositorySelected() {
        let newCategories = [];
        this.panel.selectedSVG = null;

        if (this.panel.repositories[this.panel.selectedRepository]) {
            _.forEach(this.panel.repositories[this.panel.selectedRepository].items,
                (item) => {
                    if (!_.includes(newCategories, item.category)) {
                        newCategories.push(item.category);
                    }
                })
        }

        this.panel.categories = newCategories;
    }

    categorySelected() {
        this.panel.svglist = [];
        this.panel.selectedSVG = null;

        if (this.panel.repositories[this.panel.selectedRepository]) {
            this.panel.svglist = _.filter(this.panel.repositories[this.panel.selectedRepository].items,
                (item) => item.category === this.panel.selectedCategory);
        }
    }

    addSVGItem() {
        let svg = JSON.parse(this.panel.selectedSVG);

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
        })
        this.buildSVG();
    }

    buildSVG() {
        var all = function(array) {
            var deferred = $.Deferred();
            var fulfilled = 0,
                length = array.length;
            var results = [];

            if (length === 0) {
                deferred.resolve(results);
            } else {
                array.forEach(function(promise, i) {
                    $.when(promise()).then(function(value) {
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

        let panel = this.panel;
        if (panel.useSVGBuilder) {
            let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            let svgNS = svg.namespaceURI;

            svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            svg.setAttribute('width', panel.svgBuilderData.width);
            svg.setAttribute('height', panel.svgBuilderData.height);
            svg.setAttribute('viewBox', panel.svgBuilderData.viewport.x + ' ' +
                panel.svgBuilderData.viewport.y + ' ' +
                panel.svgBuilderData.viewport.width + ' ' +
                panel.svgBuilderData.viewport.height);

            let promises = [];

            panel.svgBuilderData.elements.forEach((element) => {
                promises.push(() => {
                    return $.Deferred((dfd) => {
                        $.get('public/plugins/marcuscalidus-svg-panel/assets/' + element.path, (data) => {
                            dfd.resolve(data);
                        });
                    }).promise();
                });
            });

            $.when(all(promises)).then(results => {
                results.forEach(
                    (svgFragment, i) => {
                        let g = document.createElementNS(svgNS, 'g');
                        g.setAttribute('id', panel.svgBuilderData.elements[i].id)
                        g.setAttribute('transform', 'translate(' + panel.svgBuilderData.elements[i].x + ' ' + panel.svgBuilderData.elements[i].y + ') ' +
                            'rotate(' + panel.svgBuilderData.elements[i].rotate + ' ' + panel.svgBuilderData.elements[i].rcenterx + ' ' + panel.svgBuilderData.elements[i].rcentery + ') ' +
                            'scale(' + panel.svgBuilderData.elements[i].scale + ')');
                        svg.appendChild(g);
                        $(g).html(svgFragment.documentElement.children);
                    }
                )
                panel.svg_data = svg.outerHTML;
                this.resetSVG();
                this.render();
            });
        }
    }
    
    onChooseFile() {
        this.panel.svgImportConfig = [];
        let panel = this.panel;
        let file = document.getElementById('file').files[0];
        panel.fileName = file.name;
        panel.idList = [];
        panel.valueList = [];
        panel.js_code = "";
        panel.selectedID = null;
        panel.selectedValue = null;
        panel.metricList = this.series;
        panel.statsList = [
            {"name":"Current", "value":"current"},
            {"name":"Average", "value":"avg"},
            {"name":"Max", "value":"max"},
            {"name":"Min", "value":"min"},
            {"name":"Total", "value":"total"}
        ];
        panel.selectedStats = "total";
        if(this.series.length != 0) {
            panel.selectedMetric = this.series[0].alias;
        }
        var idList = [];
        var valueList = [];
        let fr = new FileReader();
        fr.onload = onFileLoad;
        function onFileLoad(e) {
            panel.svg_data = e.target.result;
            var elementList = document.getElementsByTagName("text");
            for (var i in elementList) {
                if(elementList[i].id) {
                    idList.push(elementList[i].id);
                }
                if(elementList[i].innerHTML != undefined && elementList[i].innerHTML.trim() != "") {
                    if(elementList[i].innerHTML != "[Not supported by viewer]"){
                        valueList.push(elementList[i].innerHTML);
                    } else {
                        var elm = elementList[i].previousElementSibling;
                        if(elm.tagName === "foreignObject"){
                            while(elm.firstElementChild) {
                                elm = elm.firstElementChild;
                            }
                            valueList.push(elm.innerHTML.trim());
                        }
                    }
                }
            }
        } 
        fr.readAsText(file);
        let currentObj = this;
        setTimeout(function() {
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

    addMetricValueWithSVG(value, metricAlias, threshold, colorcodes, showValue, statsValue){
        var thFlag = true;
        var minth, maxth, lth, mth, rth;
        var stats = statsValue;
        if(threshold != undefined && threshold != ""){
            minth = threshold.split(",")[0];
            maxth = threshold.split(",")[1];
            lth = colorcodes.split(",")[0];
            mth = colorcodes.split(",")[1];
            rth = colorcodes.split(",")[2];
        }else{
            thFlag = false;
        }
        var component = null;
        var metricValue = null;
        var index = -1;
        var thresholdBlock = "";
        var htmlObject = document.createElement('div');
        htmlObject.innerHTML = this.panel.svg_data;
        for(var i in this.panel.metricList) {
            if(this.panel.metricList[i].alias ==  metricAlias){
                metricValue = this.panel.metricList[i].stats.total;
                index = i;
                break;
            }
        }
        var elementList = htmlObject.getElementsByTagName("foreignObject");
        if(elementList.length == 0) {
            elementList = htmlObject.getElementsByTagName("text");
        }
        for (var i in elementList) {
            component = elementList[i];
            while(component.firstElementChild) {
                component = component.firstElementChild;
            }
            if(component.innerHTML.trim() === value) {
                component.setAttribute('id',(value+'_1'));
                break;
            }
        }
        var elementTagName = component.closest("g").previousElementSibling.tagName;
        this.panel.svg_data = htmlObject.innerHTML;
        this.panel.js_code = this.panel.js_code + 'document.getElementById("'+ (value+'_1') +'").innerHTML' + '= Math.round(ctrl.series['+ index +'].stats.'+stats+');';
        if(thFlag) {
            if(!showValue) {
                this.panel.js_code = this.panel.js_code + 'document.getElementById("'+ (value+'_1') +'").style = "display:none;text-align:inherit;text-decoration:inherit;";'
            }
            if(elementTagName != "path"){
                thresholdBlock = 'if(' +  minth + '> Math.round(ctrl.series['+ index + '].stats.'+stats+')){'
                   + 'document.getElementById("'+ (value+'_1') +'").closest("g").previousElementSibling.setAttribute("fill","' + lth + '");'
                   + '}else if(' + minth + '<= Math.round(ctrl.series[' + index + '].stats.'+stats+') && Math.round(ctrl.series['+ index + '].stats.'+stats+') <=' + maxth+') {'
                   + 'document.getElementById("'+ (value+'_1') +'").closest("g").previousElementSibling.setAttribute("fill","' + mth + '");'
                   + '}else if(Math.round(ctrl.series['+index+'].stats.'+stats+') >'+ maxth+') {' 
                   + 'document.getElementById("'+ (value+'_1') +'").closest("g").previousElementSibling.setAttribute("fill","' + rth + '");'
                   + '}'
            }else {
                thresholdBlock = 'var pathComp = document.getElementById("'+ (value+'_1') +'").closest("g").previousElementSibling;if(' +  minth + '> Math.round(ctrl.series['+ index +'].stats.'+stats+')){'
                    + 'while(pathComp.tagName == "path"){'
                        +'pathComp.setAttribute("fill","' + lth + '");'
                        +'pathComp.setAttribute("stroke","' + lth + '");'
                        +'pathComp = pathComp.previousElementSibling;}'
                    + '}else if(' + minth + '<= Math.round(ctrl.series[' + index + '].stats.'+stats+') && Math.round(ctrl.series['+ index + '].stats.'+stats+') <=' + maxth+') {'
                    + 'while(pathComp.tagName == "path"){'
                        +'pathComp.setAttribute("fill","' + mth + '");'
                        +'pathComp.setAttribute("stroke","' + mth + '");'
                        +'pathComp = pathComp.previousElementSibling;}'
                    + '}else if(Math.round(ctrl.series['+index+'].stats.'+stats+') >'+ maxth+') {' 
                    + 'while(pathComp.tagName == "path"){'
                        +'pathComp.setAttribute("fill","' + rth + '");'
                        +'pathComp.setAttribute("stroke","' + rth + '");'
                        +'pathComp = pathComp.previousElementSibling;}'
                    + '}'
            }
            this.panel.js_code = this.panel.js_code + thresholdBlock;
        }
        var importConf = {
            id : value + '_1',
            metric : metricAlias,
            threshold : threshold,
            colorCode : threshold != '' ? colorcodes : '',
            component : value,
            label : showValue,
            stats : stats
        };
        this.panel.svgImportConfig.push(importConf);
        this.setHandleMetricFunction();
        this.resetSVG();
        this.render();
    }
    editImportedSVG(elem) {
        for(var i=0;i<this.panel.svgImportConfig.length;i++) {
            if(this.panel.svgImportConfig[i].id == elem.id) {
                this.panel.svgImportConfig[i] = elem;
            }
        }
        this.updateSVGConfiguration(this.panel.svgImportConfig);
    }

    removeImportedSVG(elem) {
        for(var i=0;i<this.panel.svgImportConfig.length;i++) {
            if(this.panel.svgImportConfig[i].id == elem.id) {
                this.panel.svgImportConfig.splice(i, 1);
            }
        }
        this.updateSVGConfiguration(this.panel.svgImportConfig);
    }

    updateSVGConfiguration(list) {
        this.panel.js_code = "";
        for(var j=0; j<list.length;j++) {
            var value = list[j].component;
            var threshold = list[j].threshold;
            var colorcodes = list[j].colorCode;
            var metricAlias = list[j].metric;
            var label = list[j].label;
            var stats = list[j].stats;
            var thFlag = true;
            var minth, maxth, lth, mth, rth;
            if(threshold != undefined && threshold != ""){
                minth = threshold.split(",")[0];
                maxth = threshold.split(",")[1];
                lth = colorcodes.split(",")[0];
                mth = colorcodes.split(",")[1];
                rth = colorcodes.split(",")[2];
            }else{
                thFlag = false;
            }
            var metricValue = null;
            var index = -1;
            var thresholdBlock = "";
            for(var i in this.panel.metricList) {
                if(this.panel.metricList[i].alias ==  metricAlias){
                    metricValue = this.panel.metricList[i].stats.total;
                    index = i;
                    break;
                }
            }
            var elementTagName = document.getElementById(value+'_1').closest("g").previousElementSibling.tagName;
            this.panel.js_code = this.panel.js_code + 'document.getElementById("'+ (value+'_1') +'").innerHTML' + '= Math.round(ctrl.series['+ index +'].stats.'+stats+');'
            if(thFlag) {
                if(!label) {
                    this.panel.js_code = this.panel.js_code + 'document.getElementById("'+ (value+'_1') +'").style = "display:none;text-align:inherit;text-decoration:inherit;";'
                }
                if(elementTagName != "path"){
                    thresholdBlock = 'if(' +  minth + '> Math.round(ctrl.series['+ index + '].stats.'+stats+')){'
                       + 'document.getElementById("'+ (value+'_1') +'").closest("g").previousElementSibling.setAttribute("fill","' + lth + '");'
                       + '}else if(' + minth + '<= Math.round(ctrl.series[' + index + '].stats.'+stats+') && Math.round(ctrl.series['+ index + '].stats.'+stats+') <=' + maxth+') {'
                       + 'document.getElementById("'+ (value+'_1') +'").closest("g").previousElementSibling.setAttribute("fill","' + mth + '");'
                       + '}else if(Math.round(ctrl.series['+index+'].stats.'+stats+') >'+ maxth+') {' 
                       + 'document.getElementById("'+ (value+'_1') +'").closest("g").previousElementSibling.setAttribute("fill","' + rth + '");'
                       + '}'
                }else {
                    thresholdBlock = 'var pathComp = document.getElementById("'+ (value+'_1') +'").closest("g").previousElementSibling;if(' +  minth + '> Math.round(ctrl.series['+ index +'].stats.'+stats+')){'
                        + 'while(pathComp.tagName == "path"){'
                            +'pathComp.setAttribute("fill","' + lth + '");'
                            +'pathComp.setAttribute("stroke","' + lth + '");'
                            +'pathComp = pathComp.previousElementSibling;}'
                        + '}else if(' + minth + '<= Math.round(ctrl.series[' + index + '].stats.'+stats+') && Math.round(ctrl.series['+ index + '].stats.'+stats+') <=' + maxth+') {'
                        + 'while(pathComp.tagName == "path"){'
                            +'pathComp.setAttribute("fill","' + mth + '");'
                            +'pathComp.setAttribute("stroke","' + mth + '");'
                            +'pathComp = pathComp.previousElementSibling;}'
                        + '}else if(Math.round(ctrl.series['+index+'].stats.'+stats+') >'+ maxth+') {' 
                        + 'while(pathComp.tagName == "path"){'
                            +'pathComp.setAttribute("fill","' + rth + '");'
                            +'pathComp.setAttribute("stroke","' + rth + '");'
                            +'pathComp = pathComp.previousElementSibling;}'
                        + '}'
                }
                this.panel.js_code = this.panel.js_code + thresholdBlock;
            }
        }
        this.setHandleMetricFunction();
        this.resetSVG();
        this.render();
    }

    metricSelected(metric){
        console.log(metric);
    }

    statSelected(stat){
        console.log(stat);
    }

    valueSelected(val) {
        console.log(val);
    }
    
    refreshMetric(){
        this.panel.metricList = this.series;
        let currObj = this;
        setTimeout(function() {
            currObj.panel.selectedMetric = currObj.series[0].alias;
            currObj.panel.selectedStats = "total"; 
        }, 25);
    }
       
}

SVGCtrl.templateUrl = 'module.html';