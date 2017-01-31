define(function () {
    "use strict";
    var GeoJson = function (layerManager) {
        this.layerManager = layerManager;
        var layers = [];
        this.layers = layers;
        this.mode = "cityFocus";

    };

    GeoJson.prototype.add = function (name, label, active, callbackFunction) {
        var self = this;
        var resourcesUrl = "geojson/";

        if (label == "Quartieri") {
            var polygonLayer = new WorldWind.RenderableLayer(label);
        } else {
            var polygonLayer = new WorldWind.RenderableLayer(label + " ");
        }
        polygonLayer.pickEnabled = false;
        var polygonGeoJSON = new WorldWind.GeoJSONParser(resourcesUrl + name + ".geojson");

        var placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
        placemarkAttributes.imageScale = 0.2;
        placemarkAttributes.imageSource = 'icons/' + name + '.png';


        var shapeConfigurationCallback = function (geometry, properties) {
            var configuration = {};

            if (geometry.isPointType() || geometry.isMultiPointType()) {
                configuration.attributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);

            }
            else if (geometry.isLineStringType() || geometry.isMultiLineStringType()) {
                configuration.attributes = new WorldWind.ShapeAttributes(null);
                configuration.attributes.drawOutline = true;
                configuration.attributes.outlineWidth = 0.50;
            }
            else if (geometry.isPolygonType() || geometry.isMultiPolygonType()) {
                configuration.attributes = new WorldWind.ShapeAttributes(null);
                configuration.attributes.outlineWidth = 0.45;
                configuration.attributes.interiorColor = new WorldWind.Color(0, 0, 0, 0);

                configuration.attributes.outlineColor = new WorldWind.Color(0, 0, 0, 0.8);
            }

            return configuration;
        };
        try {

            var callback = function () {
                self.eyeDistance.call(self, polygonLayer);
                if (callbackFunction && typeof (callbackFunction) == "function") {
                    callbackFunction();
                }
            }
            try {
                polygonGeoJSON.load(callback, shapeConfigurationCallback, polygonLayer);
                active ? true : false;
                polygonLayer.enabled = active;
            } catch (e) {
                console.log("No vector available" + e);
            }

        } catch (e) {
            console.log("No vector available" + e);
        }

    };
    GeoJson.prototype.milanoCallback = function () {
        var self = this;
        self.layerManager.synchronizeLayerList();

        var event = jQuery.Event("change");
        event.value = {newValue: 1956};
        milanoSlider.trigger(event);


    };

    GeoJson.prototype.crowdInfo = function () {
        var self = this;
        var callback = function (layer) {
            wwd.addLayer(layer);


        };
        var polygonLayer = new WorldWind.RenderableLayer("Distribuzione cantieri");
        $.ajax({
            url: "geojson/milano_grid.json",
            success: function (res) {
                var polygonGeoJSON = new WorldWind.GeoJSONParser(JSON.stringify(res));
                polygonGeoJSON.load(callback, shapeConfigurationCallback, polygonLayer);
            }
        });

        polygonLayer.enabled = false;
        polygonLayer.pickEnabled = true;
        polygonLayer.opacity = 0.9;
        polygonLayer.raster = false;
        polygonLayer.name = "Griglia validazione";
        this.validationGrid = polygonLayer;

        var shapeConfigurationCallback = function (geometry, properties) {
            var configuration = {};

            if (geometry.isPolygonType() || geometry.isMultiPolygonType()) {
                configuration.attributes = new WorldWind.ShapeAttributes(null);
                configuration.attributes.outlineWidth = 1.0;
                configuration.attributes.interiorColor = new WorldWind.Color(
                    0, 0, 0, 0);
                configuration.attributes.outlineColor = new WorldWind.Color(
                    0, 0, 0, 0);

                configuration.attributes.properties = properties;
                configuration.attributes.drawOutline = true;
            }

            return configuration;
        };
    };


    GeoJson.prototype.placemarksFromPoints = function () {


        var points = [
                {
                    latitude: 45.46886,
                    date: "2016-12-10",
                    object: "nuova costruzione",
                    start: "2014-12-07",
                    end: "2018-01-01",
                    note: "che rumore!",
                    address: "Via Abamonti Giuseppe, 20162",
                    discomfort: "2",
                    url: "https://gruppodinterventogiuridicoweb.files.wordpress.com/2013/05/badesi-gru.jpg",
                    longitude: 9.18210,
                    crowd: 1
                },
                {
                    latitude: 45.4898,
                    date: "2016-10-17",
                    object: "lavori sotterrani",
                    start: "2015-12-10",
                    end: "2017-06-01",
                    note: "insopportabile...",
                    address: "Via Abbazia, 20155",
                    discomfort: "2",
                    url: "http://document.library.istella.it/user/514874862578196757000008/documents/a337d53a/preview_53bd43614acd400564000030.jpg",
                    longitude: 9.2050,
                    crowd: 1
                },
                {
                    latitude: 45.4929,
                    date: "2016-05-05",
                    object: "restauro",
                    start: "2015-12-10",
                    end: "2019-01-01",
                    note: "inizia la mattina alle sei!",
                    address: "Via Abetone, 20133",
                    discomfort: "3",
                    url: "http://milano.corriere.it/methode_image/2014/04/21/Milano/Foto%20Milano%20-%20Trattate/16105022-kzWF-U430101763716735C2G-1224x916@Corriere-Web-Milano-593x443.jpg?v=20140421171401",
                    longitude: 9.1651,
                    crowd: 1
                }]


            ;


        var placemark;
        var placemarkLayer = new WorldWind.RenderableLayer("Cantieri Utenti");
        points.forEach(function (p) {


            var placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
            var highlightAttributes;

            var latitude = p.latitude;
            var longitude = p.longitude;

            placemarkAttributes.imageScale = 0.3;
            placemarkAttributes.imageOffset = new WorldWind.Offset(
                WorldWind.OFFSET_FRACTION, 0.3,
                WorldWind.OFFSET_FRACTION, 0.0);
            placemarkAttributes.imageColor = WorldWind.Color.WHITE;
            placemarkAttributes.labelAttributes.offset = new WorldWind.Offset(
                WorldWind.OFFSET_FRACTION, 0.5,
                WorldWind.OFFSET_FRACTION, 1.0);
            placemarkAttributes.labelAttributes.color = WorldWind.Color.YELLOW;
            placemarkAttributes.drawLeaderLine = true;
            placemarkAttributes.leaderLineAttributes.outlineColor = WorldWind.Color.RED;


            placemark = new WorldWind.Placemark(new WorldWind.Position(latitude, longitude, 0), true, null);
            placemark.altitudeMode = WorldWind.RELATIVE_TO_GROUND;

            placemarkAttributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);
            placemarkAttributes.imageSource = "images/eye.png";

            placemark.attributes = placemarkAttributes;
            placemark.attributes.properties = p;

            highlightAttributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);
            highlightAttributes.imageScale = 0.5;
            placemark.highlightAttributes = highlightAttributes;
            placemarkLayer.addRenderable(placemark);

        });

        this.validPlacemark = placemarkLayer;
        placemarkLayer.enabled = false;
        wwd.addLayer(placemarkLayer);
    };
    GeoJson.prototype.validateColor = function () {
        var self = this;
        var grid = this.validationGrid;
        var points = this.timeSites;
        var numCantieri = [];
        var max = 0;
        grid.renderables.forEach(function (ren) {
            var bb = ren._boundaries;

            ren.enabled = false;
            points.renderables.forEach(function (p) {

                var topleft = bb[2];
                var bottomright = bb[0];

                if (p.position.latitude <= topleft.latitude && p.position.latitude >= bottomright.latitude && p.position.longitude >= topleft.longitude && p.position.longitude <= bottomright.longitude) {
                    if (p.enabled == true) {
                        if (ren.numCantieri) {
                            ren.numCantieri++;
                            max = Math.max(max, ren.numCantieri);
                        } else {
                            ren.numCantieri = 1;
                        }
                    }

                }
            });
        });
        var colors = [[0, 0, 0], [0, 255, 0], [50, 255, 10]];
        grid.renderables.forEach(function (ren) {
            var value = ren.numCantieri;
            if (value <= 0) {
                value = 1;
            }
            if (value >= 1) {
                value = 2;
                ren.stateKeyInvalid = true;
                var col = geojson.getColor(((value - 1) / (2 - 1)) * 100, colors);
                if (col[0] == 0 || !col || col[2] == 0) {
                    col = WorldWind.Color.colorFromBytes(10, 255, 10, 200);
                } else {
                    col = WorldWind.Color.colorFromBytes(col[0], col[1], col[2], 200);
                }
                ren._attributes._outlineColor = col;
                ren.enabled = true;
            } else {
                ren.enabled = false;
            }


        });
        wwd.redraw();

    };

    GeoJson.prototype.bigMilano = function () {

        var callback = function (layer) {
            wwd.addLayer(layer);
        };
        var polygonLayer = new WorldWind.RenderableLayer("Milano Changes");
        $.ajax({
            url: "geojson/bigmilano.geojson",
            success: function (res) {
                var polygonGeoJSON = new WorldWind.GeoJSONParser(JSON.stringify(res));
                polygonGeoJSON.load(callback, shapeConfigurationCallback, polygonLayer);
            }
        });

        polygonLayer.enabled = true;
        polygonLayer.pickEnabled = true;
        polygonLayer.opacity = 0.9;
        polygonLayer.raster = false;
        polygonLayer.name = "bigMilano";
        this.bigMilanoJson = polygonLayer;

        var shapeConfigurationCallback = function (geometry, properties) {
            var configuration = {};

            if (geometry.isPolygonType() || geometry.isMultiPolygonType()) {
                configuration.attributes = new WorldWind.ShapeAttributes(null);
                configuration.attributes.outlineWidth = 0.0;
                configuration.attributes.interiorColor = new WorldWind.Color(
                    0, 0, 0, 0);

                configuration.attributes.properties = properties;
                configuration.attributes.drawOutline = false;
            }

            return configuration;
        };
    };

    GeoJson.prototype.milano = function (callback) {
        var resourcesUrl = "geojson/milano_grid.json";

        var self = this;
        $.ajax({
            url: "geojson/milano_grid.json",
            success: function (res) {
                self.JSONgrid = JSON.stringify(res);
                var polygonGeoJSON = new WorldWind.GeoJSONParser(JSON.stringify(res));
                polygonGeoJSON.load(callback, shapeConfigurationCallback, polygonLayer);
            }
        });

        var polygonLayer = new WorldWind.RenderableLayer("CityFocus Result");


        var shapeConfigurationCallback = function (geometry, properties) {
            var configuration = {};

            if (geometry.isPolygonType() || geometry.isMultiPolygonType()) {
                configuration.attributes = new WorldWind.ShapeAttributes(null);
                configuration.attributes.outlineWidth = 0.0;
                configuration.attributes.interiorColor = new WorldWind.Color(
                    0, 0, 0, 0);


                configuration.attributes.drawOutline = false;
            }

            return configuration;
        };
        polygonLayer.enabled = false;
        polygonLayer.pickEnabled = false;
        polygonLayer.opacity = 0.5;
        polygonLayer.raster = true;
        this.grid = polygonLayer;
        wwd.addLayer(polygonLayer);
        // this.layerManager.synchronizeLayerList();

    };

    GeoJson.prototype.showConstruction = function () {
        this.timeSites.enabled = true;
        this.bigMilanoJson.enabled = false;
        this.validationGrid.enabled = false;
        this.validPlacemark.enabled = true;
        layerManager.synchronizeLayerList();
    };


    GeoJson.prototype.hideConstruction = function () {
        this.timeSites.enabled = false;
        this.validationGrid.enabled = false;
        this.validPlacemark.enabled = false;
    };
    GeoJson.prototype.addConstruction = function () {
        var self = this;
        var callback = function (layer) {
            wwd.addLayer(layer);
            self.filterRenderables(new Date(2013, 7, 4), new Date(2013, 8, 7));
        };

        $.ajax({
            url: "geojson/cantieri.geojson",
            success: function (res) {
                self.JSONgrid = JSON.stringify(res);
                var polygonGeoJSON = new WorldWind.GeoJSONParser(JSON.stringify(res));
                polygonGeoJSON.load(callback, shapeConfigurationCallback, polygonLayer);
            }
        });

        var polygonLayer = new WorldWind.RenderableLayer("Cantieri");


        var shapeConfigurationCallback = function (geometry, properties) {
            var placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
            placemarkAttributes.imageScale = 0.050;
            placemarkAttributes.eyeDistanceScaling = true;
            placemarkAttributes.eyeDistanceScalingThreshold = 1e5;
            placemarkAttributes.imageOffset = new WorldWind.Offset(
                WorldWind.OFFSET_FRACTION, 0.05,
                WorldWind.OFFSET_FRACTION, 0.05);

            placemarkAttributes.labelAttributes.offset = new WorldWind.Offset(
                WorldWind.OFFSET_FRACTION, 0.5,
                WorldWind.OFFSET_FRACTION, 1.0);

            placemarkAttributes.labelAttributes.color = WorldWind.Color.YELLOW;
            placemarkAttributes.drawLeaderLine = true;
            placemarkAttributes.imageSource = "images/placemark.png";


            var highlightAttributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);
            highlightAttributes.imageScale = 0.060;


            var configuration = {};

            configuration.attributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);
            configuration.highlightAttributes = highlightAttributes;
            configuration.eyeDistanceScaling = true;
            configuration.eyeDistanceScalingThreshold = 1000;

            configuration.attributes.properties = properties;

            return configuration;
        };
        polygonLayer.enabled = false;
        polygonLayer.pickEnabled = true;
        polygonLayer.opacity = 1;
        polygonLayer.raster = false;
        polygonLayer.name = "construction";
        this.timeSites = polygonLayer;
    };

    GeoJson.prototype.filterRenderables = function (date1, date2) {
        var count = 0;
        this.timeSites.renderables.forEach(function (ren) {
            var start = new Date(ren.attributes.properties["INIZIO_LAV"]);
            var end = new Date(ren.attributes.properties["CHIUSURA_P"]);
            if (end < date1 || start > date2) {
                ren.enabled = false;
            } else {
                ren.enabled = true;
                count++;
            }

        });
    };

    GeoJson.prototype.getColor = function (weight, inputColors) {
        var p, colors = [];
        if (weight < 50) {
            colors[1] = inputColors[0];
            colors[0] = inputColors[1];
            p = weight / 50;
        } else {
            colors[1] = inputColors[1];
            colors[0] = inputColors[2];
            p = (weight - 50) / 50;
        }
        var w = p * 2 - 1;
        var w1 = (w / 1 + 1) / 2;
        var w2 = 1 - w1;
        var rgb = [Math.round(colors[0][0] * w1 + colors[1][0] * w2),
            Math.round(colors[0][1] * w1 + colors[1][1] * w2),
            Math.round(colors[0][2] * w1 + colors[1][2] * w2)
        ];
        return [rgb[0], rgb[1], rgb[2], 255];
    };


    GeoJson.prototype.eyeDistance = function (layer) {
        if (layer.renderables) {
            wwd.addLayer(layer);
            if (layer.displayName !== "Quartieri") {
                this.layers.push(layer);
            }
            for (var x in layer.renderables) {
                var o = layer.renderables[x];
                o.eyeDistanceScaling = true;
                o.eyeDistanceScalingThreshold = 10000;
            }
            this.layerManager.synchronizeLayerList();
        }
    };

    GeoJson.prototype.clean = function () {
        var length = this.layers.length;
        for (var x = 0; x <= length; x++) {
            wwd.removeLayer(this.layers[x]);
        }
        this.layers = [];

    };
    return GeoJson;
})
;