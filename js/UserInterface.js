define([
    'js/proj4'
], function (proj4) {

    "use strict";

    var UserInterface = function (layerManager, geojson) {
        this.layerManager = layerManager;
        this.geojson = geojson;
        this.rasters = [];
        this.map = {};
        this.allPoints = [];
    };


    UserInterface.prototype.listeners = function () {
        var self = this;


        $(".slider").bootstrapSlider({
            ticks: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
            ticks_snap_bounds: 10,
            value: 0
        });

        var opacitySlider = $("#opacity_slider").bootstrapSlider({
            value: 4
        });

        opacitySlider.change(function (val) {
            var val = val.value.newValue;
            for (var x in self.geojson.grid.renderables) {
                self.geojson.grid.renderables[x].attributes.interiorColor.alpha = val / 10;
            }
            // self.geojson.grid.opacity = val / 10;
        });

        $('a').tooltip();

        $('a').click(function () {
            $('a').tooltip('hide');
        });

        $('#expandLayer').click(function () {
            var open = $("#layerList").attr("data-open");
            if (open == "false") {
                $("#layerList").css("max-height", "400px");
                $("#layerList").attr("data-open", true);
            } else {
                $("#layerList").css("max-height", "0px");
                $("#layerList").attr("data-open", "false")
            }
        });

        $('#expandRaster').click(function () {
            var open = $("#rasterList").attr("data-open");
            if (open == "false") {
                $("#rasterList").css("max-height", "400px");
                $("#rasterList").attr("data-open", true);
            } else {
                $("#rasterList").css("max-height", "0px");
                $("#rasterList").attr("data-open", "false")
            }
        });


        $("#reset").click(function () {
            window.location.reload();
            $(".slider").bootstrapSlider("setValue", 0);
            $("#reset").hide();
            self.geojson.clean();
            var length = self.rasters.length;
            for (var x = 0; x <= length; x++) {
                wwd.removeLayer(self.rasters[x]);
            }
            for (var x = 0; x < wwd.layers[3].renderables.length; x++) {
                wwd.layers[3].renderables[x].enabled = false;
            }
            $("#criteria_selected").html("");
            wwd.redraw();
            layerManager.synchronizeLayerList();
            wwd.layers[3].enabled = false;
        });

        $("#showChanges").click(function () {
            self.hideConstruction();
            $("#hideChanges").show();
            $("#bigMilanoMenu").show();
            $("#hideConstruction").hide();
            $("#showConstruction").show();
            self.geojson.mode = "changes";
            self.picking(true);
            $(this).hide();
        });

        $("#showConstruction").click(function () {
            $("#hideConstruction").show();
            $("#bigMilanoMenu").hide();
            $("#imageTime").hide();
            $("#hideChanges").hide();
            $("#getEvolution").hide();
            $("#constructionTime").show();
            $("#constructionMenu").show();
            $(this).hide();
            self.geojson.mode = "construction";
            self.picking(true);
            self.showConstruction();

        });


        $("#getConstruction").click(function () {
            $("#cityFocus").hide();
            $("#constructionMenu").show();
            $(".construction").hide();
            $("#getEvolution").hide();
            self.showConstruction();
            self.geojson.mode = "construction";
            self.picking(true);
            $("#constructionTime").show();
            layerManager.synchronizeLayerList();
            $("#reset").show();
        });

        $("#hideConstruction").click(function () {
            $("#showConstruction").show();
            $("#showChanges").show();
            self.hideConstruction();
            self.picking(false);
            $(this).hide();
        });

        $("#hideChanges").click(function () {
            $("#showChanges").show();
            $("#bigMilanoMenu").hide();
            $("#imageTime").hide();
            self.picking(false);
            self.geojson.bigMilanoJson.enabled = false;
            self.geojson.grid.enabled = true;
            $("#legend").show();
            $("#constructionLegend").hide();
            $(this).hide();
        });

        $("#getEvolution").click(function () {
            self.geojson.milanoCallback();
            self.geojson.mode = "changes";
            self.picking(true);
            $("#legend").hide();
            $("#constructionLegend").show();
            $("#bigMilanoMenu").show();
            $("#cityFocus").hide();
            $(".construction").hide();
            $("#reset").show();
        });

        $("#cityFocus").click(function () {
            self.geojson.mode = "cityFocus";
            $("#cityFocus").hide();
            $("#submitQuery").show();
            $("#legend").show();
            $("#getEvolution").hide();
            $("#c_two").show();
            $(".construction").hide();

        });


        $("#submitQuery").click(function () {
            $('html, body').animate({
                scrollTop: $('#footer').offset().top
            }, 'slow');
            $("#reset").show();
            var count = 0;
            var idSlider = [];
            self.geojson.clean();
            for (var x = 0; x < wwd.layers[3].renderables.length; x++) {
                wwd.layers[3].renderables[x].enabled = true;
            }
            $(".name_slider div").each(function () {
                if (this.id) {
                    idSlider.push(this.id);
                    count++;
                }
            });
            var allValues = [];
            $("#criteria_selected").html("");
            idSlider.forEach(function (id, x) {
                idSlider[x] = [];
                var value = $("#" + id).bootstrapSlider().bootstrapSlider('getValue');
                if (Number(value) > 0) {
                    value = (Math.round(value / 10) * 10);
                    idSlider[x].push(id);
                    var name = $("#" + id).parent().find("label").text();
                    var div = '<div class="selected">' + name + ' - <strong>' + value + '%</strong></div>';
                    $("#criteria_selected").append(div);
                    try {
                        self.geojson.add(id, name);
                    } catch (e) {
                        console.log("Json not available for:" + id)
                    }
                    ;
                    allValues.push([id, value]);
                }

            });


            var letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p',
                'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
            var query = 'for';
            for (var x = 0; x < allValues.length; x++) {
                query += ' ' + letters[x] + ' in (' + allValues[x][0] + ')';
                if (x < allValues.length - 1) {
                    query += ',';
                }
            }
            query += ' return encode( ( (';
            var sum = 0;
            for (var x = 0; x < allValues.length; x++) {
                query += letters[x] + '*' + allValues[x][1];
                sum += allValues[x][1];
                if (x < allValues.length - 1) {
                    query += ' + ';
                } else {
                    query += ')/' + (sum / 100);
                }
            }
            query += '), "csv") )';


            var data;
            $.ajax({
                type: "POST",
                url: 'http://131.175.143.84/rasdaman74/ows/wcps',
                data: {query: query},
                success: function (res) {
                    self.addLayer(res);
                    data = res;
                    self.addRasters(allValues);
                }
            });
            $("#showChanges").show();
            $("#showConstruction").show();

        });
    };

    UserInterface.prototype.addLayer = function (request) {


        var grid = this.geojson.grid;
        this.convertToshape(grid, request);

        $("#expandRaster").show();
        $("#expandLayer").show();
        $("#selectedCriteriaDiv").show();

        //$("#opacity").show();
        wwd.redraw();
    };

    UserInterface.prototype.addRasters = function (allValues) {
        var self = this;
        for (var x = 0; x < allValues.length; x++) {
            var query = 'for a in (' + allValues[x][0] + ')  return encode ( a*100, "csv") ';

            var ajax = function (z) {
                $.ajax({
                    type: "POST",
                    url: 'http://131.175.143.84/rasdaman74/ows/wcps',
                    data: {query: query},
                    success: function (res) {
                        self.addSingleRaster(res, allValues[z][0]);
                    }
                });
            }

            ajax(x);
        }
    };

    UserInterface.prototype.addSingleRaster = function (res, name) {

        var self = this;
        var label = $("#" + name).parent().find("label").text();
        var polygonLayer = new WorldWind.RenderableLayer(label + " Criterion Map");

        var polygonGeoJSON = new WorldWind.GeoJSONParser(geojson.JSONgrid);
        var shapeConfigurationCallback = function (geometry, properties) {
            var configuration = {};
            if (geometry.isPolygonType() || geometry.isMultiPolygonType()) {
                configuration.attributes = new WorldWind.ShapeAttributes(null);
                configuration.attributes.outlineWidth = 0.0;
                configuration.attributes.drawOutline = false;
            }
            return configuration;
        };
        self.rasters.push(polygonLayer);
        var callback = function (polygonLayer) {
            self.convertToshape(polygonLayer, res);
            polygonLayer.raster = true;
            polygonLayer.enabled = false;
            wwd.addLayer(polygonLayer);
            self.geojson.layers.push(polygonLayer);
            layerManager.synchronizeLayerList();
        };
        polygonGeoJSON.load(callback, shapeConfigurationCallback, polygonLayer);


    };


    UserInterface.prototype.showConstruction = function () {
        this.geojson.showConstruction();
    };

    UserInterface.prototype.hideConstruction = function () {
        $("#constructionMenu").hide();
        this.geojson.hideConstruction();
    };

    UserInterface.prototype.colorBigMilano = function (layer, time) {

        var csv = [];


        var max = 98;
        var min = 30;

        var self = this;
        var colors = [[2, 94, 33], [46, 81, 58], [85, 86, 86]];

        for (var x = 0; x < layer.renderables.length; x++) {
            layer.renderables[x].stateKeyInvalid = true;
            layer.renderables[x].enabled = false;
        }

        for (var x = 0; x < layer.renderables.length; x++) {
            var r = layer.renderables[x];
            var value = r._attributes.properties[time];
            value = Math.round(value / 10) * 10;
            if (!self.map[value]) {

                var col = geojson.getColor(((value - min) / (max - min)) * 100, colors);

                if (value == 0 || value < 0) {
                    col = WorldWind.Color.colorFromBytes(col[0], col[1], col[2], 20);
                } else if (value > 30 && value < 70) {
                    col = WorldWind.Color.colorFromBytes(col[0], col[1], col[2], 166);
                } else {
                    col = WorldWind.Color.colorFromBytes(col[0], col[1], col[2], 200);
                }
                self.map[value] = col;
            }
            r.attributes.interiorColor = self.map[value];

        }

        for (var x = 0; x < layer.renderables.length; x++) {
            layer.renderables[x].enabled = true;
        }

        layer.enabled = true;
        layer.opacity = 0.5;
        layerManager.synchronizeLayerList();
    };

    UserInterface.prototype.picking = function (active) {

        if (wwd.eventListeners.mousemove.listeners[1]) {
            wwd.removeEventListener("mousemove", wwd.eventListeners.mousemove.listeners[1]);
        }

        if (!active && wwd.eventListeners.click.listeners[0]) {
            wwd.removeEventListener("click", wwd.eventListeners.click.listeners[0]);
        } else {
            if (self.geojson.mode == "changes") {
                var handlePick = function (o) {

                    var x = o.clientX,
                        y = o.clientY;


                    var pickList = wwd.pick(wwd.canvasCoordinates(x, y));

                    if (pickList.objects.length > 0) {

                        for (var p = 0; p < pickList.objects.length; p++) {
                            var object = pickList.objects[p].userObject;
                            if (object._attributes && object._attributes.properties) {
                                var prop = object._attributes.properties;
                                var bounds = object._boundaries;


                                var projection32632 = "+proj=utm +zone=32 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";
                                var min = proj4('WGS84', projection32632, [bounds[2].longitude, bounds[0].latitude]);
                                var max = proj4('WGS84', projection32632, [bounds[0].longitude, bounds[2].latitude]);


                                var images = [
                                    {
                                        "year": 1955,
                                        url: 'http://www.cartografia.servizirl.it/arcgis2/services/BaseMap/Lombardia_GAI_UTM32N/MapServer/WMSServer?&service=WMS&request=GetMap&layers=0&styles=&format=image%2Fjpeg&transparent=false&version=1.1.1&height=256&width=256&srs=EPSG:32632&bbox='
                                    },
                                    //{"year":1994,
                                    //    url:'http://wms.pcn.minambiente.it/ogc?map=/ms_ogc/WMS_v1.3/raster/ortofoto_bn_94.map&service=WMS&request=GetMap&layers=OI.ORTOIMMAGINI.1994.32&styles=&format=image%2Fjpeg&transparent=false&version=1.1.1&height=256&width=256&srs=EPSG%3AEPSG:32632&bbox='
                                    // },
                                    {
                                        "year": 2000,
                                        url: 'http://wms.pcn.minambiente.it/ogc?map=/ms_ogc/WMS_v1.3/raster/ortofoto_colore_00.map&service=WMS&version=1.3.0&request=GetMap&layers=OI.ORTOIMMAGINI.2000.32&styles=&height=512&width=512&format=image/jpeg&crs=EPSG:32632&bbox='
                                    },
                                    {
                                        "year": 2007,
                                        url: 'http://www.cartografia.regione.lombardia.it/ArcGIS10/services/wms/ortofoto2007_UTM32N_wms/MapServer/WMSServer?service=WMS&request=GetMap&layers=lombardia2007wgs84.ecw&styles=&format=image%2Fjpeg&transparent=false&version=1.1.1&height=256&width=256&srs=EPSG:32632&bbox='
                                    },
                                    {
                                        "year": 2012,
                                        url: 'http://www.cartografia.regione.lombardia.it/ArcGIS10/services/wms/ortofoto2012_wms/MapServer/WMSServer?service=WMS&request=GetMap&layers=Ortofoto%202012%20AGEA&styles=&format=image%2Fjpeg&transparent=false&version=1.1.1&height=512&width=512&srs=EPSG:32632&bbox='
                                    },
                                ];


                                var bbox = min[0] + `,` + min[1] + `,` + max[0] + `,` + max[1];
                                var newDivs = '';
                                images.forEach(function (img) {
                                    newDivs += `
                        <div class="timeImage">
                            <img src="` + img.url + bbox + `"/>
                            <label>Year: ` + img.year + `</label>
                        </div>`;
                                });
                                $("#imageTime").html(newDivs);


                                $("#imageTime").show();

                            }


                        }
                    }
                };
                wwd.addEventListener("click", handlePick);
            } else if (self.geojson.mode == "construction") {
                var highlightedItems = [];

                var handleMove = function (o) {
                    var x = o.clientX,
                        y = o.clientY;
                    var redrawRequired = highlightedItems.length > 0; // must redraw if we de-highlight previously picked items

                    for (var h = 0; h < highlightedItems.length; h++) {
                        highlightedItems[h].highlighted = false;
                    }
                    highlightedItems = [];

                    var pickList = wwd.pick(wwd.canvasCoordinates(x, y));
                    if (pickList.objects.length > 0) {
                        redrawRequired = true;
                    }

                    if (pickList.objects.length > 0) {
                        for (var p = 0; p < pickList.objects.length; p++) {
                            if (!pickList.objects[p].isTerrain) {
                                pickList.objects[p].userObject.highlighted = true;
                                highlightedItems.push(pickList.objects[p].userObject);
                            }
                        }
                    }

                    if (redrawRequired) {
                        wwd.redraw();
                    }
                };
                var handlePick = function (o) {

                    var x = o.clientX,
                        y = o.clientY;


                    var pickList = wwd.pick(wwd.canvasCoordinates(x, y));

                    if (pickList.objects.length > 0) {

                        for (var p = 0; p < pickList.objects.length; p++) {
                            var object = pickList.objects[p].userObject;

                            if (object.attributes && object.attributes.properties && object.attributes.properties.OBJECTID) {

                                var newText = "<h3>Star date: </h3>";
                                newText += object.attributes.properties.INIZIO_LAV;
                                newText += "<br>";
                                newText += "<h3>End date: </h3>";
                                newText += object.attributes.properties.CHIUSURA_P;
                                newText += "<br>";
                                newText += "<h3>Current use: </h3>";
                                newText += object.attributes.properties.USI_ATTUAL;
                                newText += "<br>";
                                newText += "<h3>Project use: </h3>";
                                newText += object.attributes.properties.USI_PROGET;
                                newText += "<br>";
                                $("#infoBar").html(newText);


                            } else if (object.attributes && object.attributes.properties && object.attributes.properties.crowd) {

                                var newText = "<h3>Date: </h3>";
                                newText += object.attributes.properties.date;
                                newText += "<br>";
                                newText += "<h3>Object of the work: </h3>";
                                newText += object.attributes.properties.object;
                                newText += "<br>";
                                newText += "<h3>Start date: </h3>";
                                newText += object.attributes.properties.start;
                                newText += "<br>";
                                newText += "<h3>End date: </h3>";
                                newText += object.attributes.properties.end;
                                newText += "<br>";
                                newText += "<h3>Note: </h3>";
                                newText += object.attributes.properties.note;
                                newText += "<br>";
                                newText += "<h3>Address: </h3>";
                                newText += object.attributes.properties.address;
                                newText += "<br>";
                                newText += "<h3>Discomfort: </h3>";
                                newText += object.attributes.properties.discomfort;
                                newText += "<br>";

                                $("#infoBar").html(newText);


                            }

                        }

                    }

                };
                wwd.addEventListener("click", handlePick);
                wwd.addEventListener("mousemove", handleMove);

            }

        }
    };

    UserInterface.prototype.convertToshape = function (grid, data) {

        var csv = [];

        data = data.split("},");
        var max = 0;
        for (var x = 0; x < data.length; x++) {
            var str = data[x].replace(/\{|\}/g, '');
            str = str.split(",");

            for (var y = 0; y < str.length; y++) {

                var temp = Number(str[y]);
                max = Math.max(max, temp);
                csv.push(temp);

            }
        }


        var self = this;
        var colors = [[141, 193, 197], [255, 237, 170], [215, 25, 28]];

        var rightIndex = 94;
        var topIndex = 85;
        for (var x = 0; x < grid.renderables.length; x++) {
            grid.renderables[x].stateKeyInvalid = true;
            grid.renderables[x].enabled = false;
        }

        for (var x = 0; x < grid.renderables.length; x++) {

            topIndex--;

            if (topIndex == 0) {
                topIndex = 84;
                rightIndex--;
            }

            var r = grid.renderables[(94 * topIndex) - rightIndex];

            //r.pathType = WorldWind.LINEAR;
            // r.maximumNumEdgeIntervals = 1;
            var value = csv[x];
            value = Math.round(value / 10) * 10;
            if (!self.map[value]) {

                var col = geojson.getColor(((value - 0) / (max - 0)) * 100, colors);

                if (value == 0) {
                    col = WorldWind.Color.colorFromBytes(col[0], col[1], col[2], 40);
                } else {
                    col = WorldWind.Color.colorFromBytes(col[0], col[1], col[2], 126);
                }
                self.map[value] = col;
            }
            r.attributes.interiorColor = self.map[value];

        }

        for (var x = 0; x < grid.renderables.length; x++) {
            grid.renderables[x].enabled = true;
        }

        grid.enabled = true;
        grid.opacity = 0.5;
        layerManager.synchronizeLayerList();
    };

    return UserInterface
})

