/*
 * Copyright (C) 2014 United States Government as represented by the Administrator of the
 * National Aeronautics and Space Administration. All Rights Reserved.
 */
var milanoSlider;
/**
 * @exports LayerManager
 */
define(function () {
    "use strict";

    /**
     * Constructs a layer manager for a specified {@link WorldWindow}.
     * @alias LayerManager
     * @constructor
     * @classdesc Provides a layer manager to interactively control layer visibility for a World Window.
     * @param {WorldWindow} worldWindow The World Wi#c_one_home_app {
    background-color: #f6f6f6;
    padding: 30px;
    padding-bottom: 5px;
    color: white;
}ndow to associated this layer manager with.
     */
    var LayerManager = function (worldWindow) {
        var thisExplorer = this;

        this.wwd = worldWindow;
        this.milanoPresent = 0;
        this.constructionPresent = 0;
        this.validationPresent = 0;
        this.cantieriPresent = 0;
        this.roundGlobe = this.wwd.globe;

        this.createProjectionList();
        $("#projectionDropdown").find(" li").on("click", function (e) {
            thisExplorer.onProjectionClick(e);
        });

        this.synchronizeLayerList();

        $("#searchBox").find("button").on("click", function (e) {
            thisExplorer.onSearchButton(e);
        });

        this.geocoder = new WorldWind.NominatimGeocoder();
        this.goToAnimator = new WorldWind.GoToAnimator(this.wwd);
        $("#searchText").on("keypress", function (e) {
            thisExplorer.onSearchTextKeyPress($(this), e);
        });

        //
        //this.wwd.redrawCallbacks.push(function (worldWindow, stage) {
        //    if (stage == WorldWind.AFTER_REDRAW) {
        //        thisExplorer.updateVisibilityState(worldWindow);
        //    }
        //});
    };


    LayerManager.prototype.flat = function () {

        if (!this.flatGlobe) {
            this.flatGlobe = new WorldWind.Globe2D();
        }
        this.flatGlobe.projection = new WorldWind.ProjectionMercator();

        this.wwd.globe = this.flatGlobe;


        this.wwd.redraw();
    };
    LayerManager.prototype.onProjectionClick = function (event) {
        var projectionName = event.target.innerText || event.target.innerHTML;
        $("#projectionDropdown").find("button").html(projectionName + ' <span class="caret"></span>');

        if (projectionName === "3D") {
            if (!this.roundGlobe) {
                this.roundGlobe = new WorldWind.Globe(new WorldWind.EarthElevationModel());
            }

            if (this.wwd.globe !== this.roundGlobe) {
                this.wwd.globe = this.roundGlobe;
            }
        } else {
            if (!this.flatGlobe) {
                this.flatGlobe = new WorldWind.Globe2D();
            }

            if (projectionName === "Equirectangular") {
                this.flatGlobe.projection = new WorldWind.ProjectionEquirectangular();
            } else if (projectionName === "Mercator") {
                this.flatGlobe.projection = new WorldWind.ProjectionMercator();
            } else if (projectionName === "North Polar") {
                this.flatGlobe.projection = new WorldWind.ProjectionPolarEquidistant("North");
            } else if (projectionName === "South Polar") {
                this.flatGlobe.projection = new WorldWind.ProjectionPolarEquidistant("South");
            } else if (projectionName === "North UPS") {
                this.flatGlobe.projection = new WorldWind.ProjectionUPS("North");
            } else if (projectionName === "South UPS") {
                this.flatGlobe.projection = new WorldWind.ProjectionUPS("South");
            } else if (projectionName === "North Gnomonic") {
                this.flatGlobe.projection = new WorldWind.ProjectionUPS("North");
            } else if (projectionName === "South Gnomonic") {
                this.flatGlobe.projection = new WorldWind.ProjectionUPS("South");
            }

            if (this.wwd.globe !== this.flatGlobe) {
                this.wwd.globe = this.flatGlobe;
            }
        }

        this.wwd.redraw();
    };

    LayerManager.prototype.onLayerClick = function (layerButton) {
        var layerName = layerButton.text();

        // Update the layer state for the selected layer.
        for (var i = 0, len = this.wwd.layers.length; i < len; i++) {
            var layer = this.wwd.layers[i];
            if (layer.hide) {
                continue;
            }

            if (layer.displayName === layerName) {
                layer.enabled = !layer.enabled;
                if (layer.enabled) {
                    layerButton.addClass("active");
                } else {
                    layerButton.removeClass("active");
                }
                this.wwd.redraw();
                break;
            }
        }
    };


    LayerManager.prototype.synchronizeLayerList = function () {
        var self = this;
        var layerListItem = $("#layerList");
        var rasterListItem = $("#rasterList");

        layerListItem.find("button").off("click");
        layerListItem.find("button").remove();

        rasterListItem.find("button").off("click");
        rasterListItem.find("button").remove();


        // Synchronize the displayed layer list with the World Window's layer list.
        for (var i = 2, len = this.wwd.layers.length; i < len; i++) {
            var layer = this.wwd.layers[i];
            if (layer.hide) {
                continue;
            }

            var rasterItem = undefined;
            var layerItem = undefined;

            if (layer.raster) {

                rasterItem = $('<button class="list-group-item btn btn-block">' + layer.displayName + '</button>');
                rasterListItem.append(rasterItem);

            } else {
                layerItem = $('<button class="list-group-item btn btn-block">' + layer.displayName + '</button>');

                if (layer.name == "bigMilano" && !self.milanoPresent) {
                    self.milanoPresent = 1;
                    $("#bigMilanoMenu").append(layerItem);

                    var slider = `
                    <div class="name_slider1" id="timeMilano">
                        <label>Time</label>
                        <div class="slider_milano" id="milanoTime"></div>
                        </div>`;
                    $("#bigMilanoMenu").append(slider);
                    milanoSlider = $("#milanoTime").bootstrapSlider({
                        ticks: [1956, 2000, 2007, 2009, 2012],
                        ticks_snap_bounds: 1000,
                        ticks_labels: [1956, 2000, 2007, 2009, 2012],
                        ticks_positions: [0, 30, 60, 80, 100],
                        value: 0
                    });
                    milanoSlider.change(function (val) {

                        var val = val.value.newValue;
                        switch (val) {
                            case 1956:
                                UI.colorBigMilano(geojson.bigMilanoJson, "CN_GAI");
                                UI.currentYear = "CN_GAI";
                                break;
                            case 2000:
                                UI.colorBigMilano(geojson.bigMilanoJson, "CN_00");
                                UI.currentYear = "CN_00";
                                break;
                            case 2007:
                                UI.colorBigMilano(geojson.bigMilanoJson, "CN_07");
                                UI.currentYear = "CN_07";
                                break;
                            case 2009:
                                UI.colorBigMilano(geojson.bigMilanoJson, "CN_09");
                                UI.currentYear = "CN_09";
                                break;
                            case 2012:
                                UI.colorBigMilano(geojson.bigMilanoJson, "CN_12");
                                UI.currentYear = "CN_12";
                                break;

                        }

                        if (wwd.layers[3].displayName == "CityFocus Result") {
                            wwd.layers[3].enabled = false;
                        }
                        $("#legend").hide();
                        $("#constructionLegend").show();
                    });
                } else if (layer.name == "construction" && !self.constructionPresent && layer.enabled) {
                    self.constructionPresent = 1;

                    $("#constructionMenu").append(layerItem);

                    var slider = `
                    <div class="name_slider2" id="timeCantieri">
                        <label>Time</label>
                        <div class="slider_cantieri" id="milanoCantieri"></div>
                        </div>`;


                    $("#constructionTime").append(slider);
                    $("#milanoCantieri").dateRangeSlider({
                        arrows: false,
                        defaultValues: {
                            min: new Date(2013, 7, 4),
                            max: new Date(2013, 7, 21)
                        },
                        formatter: function (val) {
                            var days = val.getDate(),
                                month = val.getMonth() + 1,
                                year = val.getFullYear();
                            return days + "/" + month + "/" + year;
                        },
                        range: {min: {days: 1}},
                        bounds: {
                            min: new Date(2013, 0, 1),
                            max: new Date(2016, 11, 31)
                        }
                    });

                    $("#milanoCantieri").bind("valuesChanged", function (e, data) {
                        geojson.filterRenderables(new Date(data.values.min), new Date(data.values.max));
                        geojson.validateColor();
                    });


                } else if (layer.name == "Griglia validazione" && !self.validationPresent) {
                    self.validationPresent = 1;
                    //   $("#constructionMenu").append(layerItem);
                    layerListItem.append(layerItem);

                } else if (layer.name == "Cantieri - VGI" && !self.cantieriPresent) {
                    self.cantieriPresent = 1;
                    //  $("#constructionMenu").append(layerItem);
                    layerListItem.append(layerItem);

                } else if (layer.name !== "bigMilano" && layer.name !== "construction") {
                    layerListItem.append(layerItem);
                }
            }
            if (layer.showSpinner && Spinner) {
                var opts = {
                    scale: 0.9,
                };
                var spinner = new Spinner(opts).spin();
                if (layerItem)
                    layerItem.append(spinner.el);
                if (rasterItem)
                    rasterItem.append(spinner.el);
            }

            if (layer.enabled) {
                if (layerItem)
                    layerItem.addClass("active");
                if (rasterItem)
                    rasterItem.addClass("active");
            } else {
                if (layerItem)
                    layerItem.removeClass("active");
                if (rasterItem)
                    rasterItem.removeClass("active");
            }
        }

        var self = this;
        layerListItem.find("button").on("click", function (e) {
            self.onLayerClick($(this));
        });

        $("#bigMilanoMenu").find("button").on("click", function (e) {
            self.onLayerClick($(this));
        });

        $("#constructionMenu").find("button").on("click", function (e) {
            self.onLayerClick($(this));
        });

        rasterListItem.find("button").on("click", function (e) {
            self.onLayerClick($(this));
        });

    };

    LayerManager.prototype.createProjectionList = function () {
        var projectionNames = [
            "3D",
            "2D"
        ];
        var projectionDropdown = $("#projectionDropdown");

        var dropdownButton = $('<button class="btn btn-info btn-block dropdown-toggle" type="button" data-toggle="dropdown">3D<span class="caret"></span></button>');
        projectionDropdown.append(dropdownButton);

        var ulItem = $('<ul class="dropdown-menu">');
        projectionDropdown.append(ulItem);

        for (var i = 0; i < projectionNames.length; i++) {
            var projectionItem = $('<li><a >' + projectionNames[i] + '</a></li>');
            ulItem.append(projectionItem);
        }

        ulItem = $('</ul>');
        projectionDropdown.append(ulItem);
    };

    LayerManager.prototype.onSearchButton = function (event) {
        this.performSearch($("#searchText")[0].value)
    };

    LayerManager.prototype.onSearchTextKeyPress = function (searchInput, event) {
        if (event.keyCode === 13) {
            searchInput.blur();
            this.performSearch($("#searchText")[0].value)
        }
    };

    LayerManager.prototype.performSearch = function (queryString) {
        if (queryString) {
            var thisLayerManager = this,
                latitude, longitude;

            if (queryString.match(WorldWind.WWUtil.latLonRegex)) {
                var tokens = queryString.split(",");
                latitude = parseFloat(tokens[0]);
                longitude = parseFloat(tokens[1]);
                thisLayerManager.goToAnimator.goTo(new WorldWind.Location(latitude, longitude));
            } else {
                this.geocoder.lookup(queryString, function (geocoder, result) {
                    if (result.length > 0) {
                        latitude = parseFloat(result[0].lat);
                        longitude = parseFloat(result[0].lon);

                        WorldWind.Logger.log(
                            WorldWind.Logger.LEVEL_INFO, queryString + ": " + latitude + ", " + longitude);

                        thisLayerManager.goToAnimator.goTo(new WorldWind.Location(latitude, longitude));
                    }
                });
            }
        }
    };

    return LayerManager;
});