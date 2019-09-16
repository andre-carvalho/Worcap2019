var barChart = dc.barChart('#line');
var pieChart = dc.pieChart('#pie');
var countChart = dc.dataCount("#mystats");
var tableChart = dc.dataTable("#mytable");
var cf;

var loadData=function() {

    d3.json("data/deter-cerrado-daily.json", normalizeData);

};

var normalizeData=function(errors, data) {
    var json=[];
    if(errors) {
        console.log(JSON.stringify(errors));
    }else{
        var numberFormat = d3.format('.4f');
        
        // normalize/parse data
        data.features.forEach(function(d) {
            var o={uf:d.properties.h,ocl:d.properties.c,county:d.properties.i};
            o.uc = (d.properties.j)?(d.properties.j):('null');
            var auxDate = new Date(d.properties.g + 'T04:00:00.000Z');
            o.timestamp = auxDate.getTime();
            o.areaKm = numberFormat(d.properties.e)*1;// area municipio
            o.areaUcKm = ((d.properties.f)?(numberFormat(d.properties.f)*1):(0));
            json.push(o);
        });

        registerDimensions(json);
    }
};

var registerDimensions=function(json) {

    var dimensions={}, groups={};
    cf = crossfilter(json);

    // municipality dimension
    dimensions["county"] = cf.dimension(function(d) {return d.county+"/"+d.uf;});
    // time dimension
    dimensions["time"] = cf.dimension(function(d) {return d.timestamp;});
    // uf dimension
    dimensions["uf"] = cf.dimension(function(d) {return d.uf;});

    // municipality group
    groups["county"] = dimensions["county"].group().reduceSum(function(d) {return +d.areaKm;});
    // uf group
    groups["uf"] = dimensions["uf"].group().reduceSum(function(d) {return +d.areaKm;});
    // time group
    groups["time"] = dimensions["time"].group().reduceSum(function(d) {return +d.areaKm;});

    groups["table"] = dimensions["county"].group().reduce(
        function (p, v) {
            ++p.count;
            p.total += (Math.abs(+v.areaKm)<1e-6) ? 0 : +v.areaKm;
            return p;
        },
        function (p, v) {
            --p.count;
            p.total -= (Math.abs(+v.areaKm)<1e-6) ? 0 : +v.areaKm;
            return p;
        },
        function () {
            return {count: 0, total: 0}
        });

    buildCharts(dimensions, groups);
};

var buildCharts=function(dimensions, groups) {
    // prepare time range
    var alertsMaxDate = dimensions["time"].top(1),
		alertsMinDate = dimensions["time"].bottom(1);
    var lastDate=new Date(alertsMaxDate[0].timestamp),
		firstDate=new Date(alertsMinDate[0].timestamp);
		lastDate=new Date(lastDate.setMonth(lastDate.getMonth()+1));
		lastDate=new Date(lastDate.setDate(lastDate.getDate()+7));
        firstDate=new Date(firstDate.setDate(firstDate.getDate()-7));
        
    var x = d3.time.scale().domain([firstDate, lastDate]);
    barChart
        .width(window.innerWidth*0.7)
        .height(300)
        .x(x)
        .yAxisLabel("Área")
        .xAxisLabel("Data")
        .elasticY(true)
        .elasticX(true)
        .dimension(dimensions["time"])
        .group(removeLittlestValues(groups["time"]));

    pieChart
        .width(window.innerWidth*0.25)
        .height(300)
        .innerRadius(40).externalLabels(15).externalRadiusPadding(30).drawPaths(false)
        .legend(dc.legend())
        .dimension(dimensions["uf"])
        .group(removeLittlestValues(groups["uf"]));

    countChart
        .dimension(cf)
        .group(cf.groupAll());

    tableChart
        .dimension(groups["table"])
        .sortBy(function (d) {
            return d.value.total;
        })
        .group(function (d) {
            return d.key.split("/")[1];
        })
        .columns([
            {
                label: "Município/Estado",
                format: function (d) { return d.key.split("/")[0] },
            },
            {
                label: "Área (km²)",
                format: function (d) { return d.value.total.toFixed(2) },
            },
            {
                label: "Número de ALertas",
                format: function (d) { return d.value.count },
            }
        ])
        .size(Infinity)
        .order(d3.descending)
        .on('preRender', updateOffset)
        .on('preRedraw', updateOffset)
        .on('pretransition', display);

    dc.renderAll();
};

/*
* Remove numeric values less than 1e-6
*/
var removeLittlestValues=function(sourceGroup) {
    return {
        all:function () {
            return sourceGroup.all().filter(function(d) {
                return (Math.abs(d.value)<1e-6) ? 0 : d.value;
            });
        },
        top: function(n) {
            return sourceGroup.top(Infinity)
                .filter(function(d){
                    return (Math.abs(d.value)>1e-6);
                    })
                .slice(0, n);
        }
    };
};

// use odd page size to show the effect better
var ofs = 0, pag = 30;

var updateOffset=function() {
    var totFilteredRecs = cf.groupAll().value();
    var end = ofs + pag > totFilteredRecs ? totFilteredRecs : ofs + pag;
    ofs = ofs >= totFilteredRecs ? Math.floor((totFilteredRecs - 1) / pag) * pag : ofs;
    ofs = ofs < 0 ? 0 : ofs;
    tableChart.beginSlice(ofs);
    tableChart.endSlice(ofs+pag);
};

var display=function() {
    var totFilteredRecs = cf.groupAll().value();
    var end = ofs + pag > totFilteredRecs ? totFilteredRecs : ofs + pag;
    d3.select('#begin')
        .text(end === 0? ofs : ofs + 1);
    d3.select('#end')
        .text(end);
    d3.select('#last')
        .attr('disabled', ofs-pag<0 ? 'true' : null);
    d3.select('#next')
        .attr('disabled', ofs+pag>=totFilteredRecs ? 'true' : null);
    d3.select('#size').text(totFilteredRecs);
    if(totFilteredRecs != cf.size()){
      d3.select('#totalsize').text("(Total: " + cf.size() + " )");
    }else{
      d3.select('#totalsize').text('');
    }
};

var next=function() {
    ofs += pag;
    updateOffset();
    tableChart.redraw();
};

var last=function() {
    ofs -= pag;
    updateOffset();
    tableChart.redraw();
};

window.onload=loadData();
