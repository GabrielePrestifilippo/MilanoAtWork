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

        if (label == "Neighborhoods") {
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
    };


    GeoJson.prototype.hideConstruction = function () {
        this.timeSites.enabled = false;
    };
    GeoJson.prototype.addConstruction = function () {
        var callback = function (layer) {
            wwd.addLayer(layer);
            self.filterRenderables(new Date(2013, 7, 4), new Date(2013, 8, 7));
            var annotationsLayer = new WorldWind.RenderableLayer("Annotations");
            var annotations = [],
                annotation,
                annotationAttributes;
            for (var z = 0; z < layer.renderables.length; z++) {
                annotationAttributes = new WorldWind.AnnotationAttributes(null);
                annotationAttributes.cornerRadius = 14;
                annotationAttributes.backgroundColor = new WorldWind.Color(30,30,30,1);
                annotationAttributes.textColor = new WorldWind.Color(1, 1, 1, 1);
                annotationAttributes.drawLeader = true;
                annotationAttributes.leaderGapWidth = 40;
                annotationAttributes.leaderGapHeight = 30;
                annotationAttributes.opacity = 1;
                annotationAttributes.scale = 1;
                annotationAttributes.width = 200;
                annotationAttributes.height = 100;
                annotationAttributes.textAttributes.color = WorldWind.Color.WHITE;
                annotationAttributes.insets = new WorldWind.Insets(10, 10, 10, 10);

                annotation = new WorldWind.Annotation(layer.renderables[z].position, annotationAttributes);
                annotation.label = layer.renderables[z].attributes.properties.ESITO_PRAT;
                annotations.push(annotation);
                annotation.enabled=false;
                layer.renderables[z].annotation=annotation;
                annotationsLayer.addRenderable(annotation);
            }

            wwd.addLayer(annotationsLayer);
        };
        var self = this;
        $.ajax({
            url: "geojson/cantieri.geojson",
            success: function (res) {
                self.JSONgrid = JSON.stringify(res);
                var polygonGeoJSON = new WorldWind.GeoJSONParser(JSON.stringify(res));
                polygonGeoJSON.load(callback, shapeConfigurationCallback, polygonLayer);
            }
        });

        var polygonLayer = new WorldWind.RenderableLayer("Construction Sites");



        var shapeConfigurationCallback = function (geometry, properties) {
            var placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
            placemarkAttributes.imageScale = 0.15;
            placemarkAttributes.eyeDistanceScaling = true;
            placemarkAttributes.eyeDistanceScalingThreshold = 1e5;
            placemarkAttributes.imageOffset = new WorldWind.Offset(
                WorldWind.OFFSET_FRACTION, 0.3,
                WorldWind.OFFSET_FRACTION, 0.0);

            placemarkAttributes.labelAttributes.offset = new WorldWind.Offset(
                WorldWind.OFFSET_FRACTION, 0.5,
                WorldWind.OFFSET_FRACTION, 1.0);

            placemarkAttributes.labelAttributes.color = WorldWind.Color.YELLOW;
            placemarkAttributes.drawLeaderLine = true;
            placemarkAttributes.imageSource = "images/placemark.png";


            var highlightAttributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);
            highlightAttributes.imageScale = 0.35;


            var configuration = {};

            configuration.attributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);
            configuration.highlightAttributes = highlightAttributes;
            //configuration.name = "xxx";
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
        console.log(count);
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
            if (layer.displayName !== "Neighborhoods") {
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