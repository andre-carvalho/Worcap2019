let dashboard={

    barChart:null,
    pieChart:null,
    countChart:null,
    tableChart:null,
    cf:null,

    init(){
        window.onload=this.loadData();
    },
    

    loadData() {

        d3.json("data/deter-cerrado-daily.json", this.normalizeData);

    },

    normalizeData(errors, data) {
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

            dashboard.registerDimensions(json);
        }
    },

    registerDimensions(json) {

        var dimensions={}, groups={};
        this.cf = crossfilter(json);

        // municipality dimension
        dimensions["county"] = this.cf.dimension(function(d) {return d.county+"/"+d.uf;});
        // time dimension
        dimensions["time"] = this.cf.dimension(function(d) {return d.timestamp;});
        // uf dimension
        dimensions["uf"] = this.cf.dimension(function(d) {return d.uf;});

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

        this.buildCharts(dimensions, groups);
    },

    buildBarChart(dimensions, groups) {
        // prepare time range
        var alertsMaxDate = dimensions["time"].top(1),
            alertsMinDate = dimensions["time"].bottom(1);
        var lastDate=new Date(alertsMaxDate[0].timestamp),
            firstDate=new Date(alertsMinDate[0].timestamp);
            lastDate=new Date(lastDate.setMonth(lastDate.getMonth()+1));
            lastDate=new Date(lastDate.setDate(lastDate.getDate()+7));
            firstDate=new Date(firstDate.setDate(firstDate.getDate()-7));
            
        var x = d3.time.scale().domain([firstDate, lastDate]);
        this.barChart=dc.barChart('#line');
    
        this.barChart
            .width(window.innerWidth*0.7)
            .height(300)
            .x(x)
            .yAxisLabel("Área")
            .xAxisLabel("Data")
            .elasticY(true)
            .elasticX(true)
            .dimension(dimensions["time"])
            .group(dashboard.removeLittlestValues(groups["time"]));
    },

    buildPieChart(dimensions, groups) {
        this.pieChart=dc.pieChart('#pie');
    
        this.pieChart
            .width(window.innerWidth*0.25)
            .height(300)
            .innerRadius(40).externalLabels(15).externalRadiusPadding(30).drawPaths(false)
            .legend(dc.legend())
            .dimension(dimensions["uf"])
            .group(dashboard.removeLittlestValues(groups["uf"]));
    },

    buildCountChart() {
        this.countChart=dc.dataCount("#mystats");
    
        this.countChart
            .dimension(this.cf)
            .group(this.cf.groupAll());
    },

    buildDataTableChart(groups) {
        // display table navigation controller
        document.getElementById('paging').style="display: inline;";

        this.tableChart=dc.dataTable("#mytable");
        this.tableChart
            .dimension(groups["table"])
            .sortBy(function (d) {
                return d.value.total;
            })
            .group(function (d) {
                return "Estado: "+d.key.split("/")[1];
            })
            .columns([
                {
                    label: "Municípios",
                    format: function (d) {
                        return d.key.split("/")[0];
                    }
                },
                {
                    label: "Área (km²)",
                    format: function (d) {
                        return d.value.total.toFixed(2);
                    }
                },
                {
                    label: "Número de ALertas",
                    format: function (d) {
                        return d.value.count;
                    }
                }
            ])
            .size(dashboard.pag)
            .order(d3.descending)
            .on('preRender', dashboard.updateOffset)
            .on('preRedraw', dashboard.updateOffset)
            .on('pretransition', dashboard.display);
    },

    buildCharts(dimensions, groups) {

        this.buildCountChart();
        
        this.buildBarChart(dimensions, groups);
        
        this.buildPieChart(dimensions, groups);

        this.buildDataTableChart(groups);

        // render charts
        dc.renderAll();
    },

    /*
    * Remove numeric values less than 1e-6
    */
    removeLittlestValues(sourceGroup) {
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
    },

    /**
     * Table pagination methods
     */

    // page size
    ofs:0,
    pag:30,

    updateOffset() {
        var totFilteredRecs = dashboard.cf.groupAll().value();
        dashboard.ofs = dashboard.ofs >= totFilteredRecs ? Math.floor((totFilteredRecs - 1) / dashboard.pag) * dashboard.pag : dashboard.ofs;
        dashboard.ofs = dashboard.ofs < 0 ? 0 : dashboard.ofs;
        dashboard.tableChart.beginSlice(dashboard.ofs);
        dashboard.tableChart.endSlice(dashboard.ofs+dashboard.pag);
    },

    display() {
        var totFilteredRecs = dashboard.cf.groupAll().value();
        var end = dashboard.ofs + dashboard.pag > totFilteredRecs ? totFilteredRecs : dashboard.ofs + dashboard.pag;
        d3.select('#begin')
            .text(end === 0? dashboard.ofs : dashboard.ofs + 1);
        d3.select('#end')
            .text(end);
        d3.select('#last')
            .attr('disabled', dashboard.ofs-dashboard.pag<0 ? 'true' : null);
        d3.select('#next')
            .attr('disabled', dashboard.ofs+dashboard.pag>=totFilteredRecs ? 'true' : null);
        d3.select('#size').text(totFilteredRecs);
        if(totFilteredRecs != dashboard.cf.size()){
            d3.select('#totalsize').text("(Total: " + dashboard.cf.size() + " )");
        }else{
            d3.select('#totalsize').text('');
        }
    },

    next() {
        dashboard.ofs += dashboard.pag;
        this.updateOffset();
        this.tableChart.redraw();
    },

    last() {
        dashboard.ofs -= dashboard.pag;
        this.updateOffset();
        this.tableChart.redraw();
    }

};

dashboard.init();
