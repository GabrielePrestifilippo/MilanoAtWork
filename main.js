$(function () {
    $("#header").load("header.html");
    $("#footer").load("footer.html");
});
var application;
var UI;
require(['js/worldwind', 'js/UserInterface', 'js/geojson'],
    function (worldwind, UserInterface, GeoJson) {

        if (application) {
            var self = this;
            worldwind = new worldwind();
            this.geojson = new GeoJson(worldwind.layerManager);
            UI = new UserInterface(worldwind.layerManager, this.geojson);
            UI.listeners();
            addOSM(worldwind.layerManager, geojson);
            function addOSM(layerManager, geojson) {
                var callback = function () {
                    geojson.milano.call(geojson);
                    self.geojson.bigMilano();

                    self.geojson.addConstruction();
                    self.geojson.crowdInfo();
                    self.geojson.placemarksFromPoints();
                    self.geojson.bigMilano();

                }
                geojson.add("Quartieri", "Quartieri", 1, callback);


                //$("#getConstruction").click();

            };


        }
    });


var poi = {};
var profile = {};
var object, start_date, end_date, note, disturbance, address_poi;
var username, password_registration_1, password_registration_2, address_registration, email, phone, notification_email, notification_sms;
var date, day, month, year;

function formatDate(str) {
    var splitted = str.split("/");
    return splitted[2] + "-" + splitted[1] + "-" + splitted[0];
}

$("#poi_form_b").click(function () {
    object = $("#object").val();
    start_date = formatDate($("#start_date").val());
    end_date = formatDate($("#end_date").val());
    note = $("#note").val();
    address_poi = $("#address_poi_via").val() + ", " + $("#address_poi_cap").val();

    date = new Date();
    day = date.getDate();
    month = date.getMonth();
    year = date.getFullYear();
    poi['date'] = year + "-" + month + "-" + day
    poi['object'] = object;
    poi['start_date'] = start_date;
    poi['end_date'] = end_date;
    poi['note'] = note;
    poi['address'] = address_poi;
    poi_string = JSON.stringify(poi);
    console.log(poi_string);

    $.ajax({
        type: "POST",
        url: "http://131.175.143.84/node/save",
        data: poi,
        success: function (data) {
            console.log(data);
        },
        dataType: "application/json; charset=utf-8"
    });
});

$("#registration_form_b").click(function () {
    username = $("#username").val();
    password_registration_1 = $("#password_registration_1").val();
    password_registration_2 = $("#password_registration_2").val();
    address_registration = $("#address_registration").val();
    email = $("#email").val();
    phone = $("#phone").val();
    notification_email = $("#notification_email").val();
    notification_sms = $("#notification_sms").val();

    profile['username'] = username;
    profile['password'] = password_registration_1;
    profile['address'] = address_registration;
    profile['email'] = email;
    profile['phone'] = phone;
    profile['notification_email'] = notification_email;
    profile['notification_sms'] = notification_sms;
    profile_string = JSON.stringify(profile);
    console.log(profile_string);
});

function getCP(position) {
    poi['latitude'] = position.coords.latitude;
    poi['longitude'] = position.coords.longitude;
    console.log(position.coords.latitude + ", " + position.coords.longitude);
}
$("#get_location").click(function () {
    console.log("get_location is clicked");
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(getCP);
    }
    else {
        console.log("geolocation is not supported by this browser");
    }
});

var disturbance_x = ["disturbance_zero", "disturbance_one", "disturbance_two", "disturbance_three"];
$("#disturbance_zero, #disturbance_one, #disturbance_two, #disturbance_three").click(function (event) {
    $(this).css("width", "20px");
    //console.log(event.target.id);
    for (var i = 0; i < disturbance_x.length; i++) {
        if (disturbance_x[i] != event.target.id)
            $("#" + disturbance_x[i]).css("width", "15px");
    }
    poi['disturbance'] = event.target.id.split("_")[1];
    //console.log(event.target.id.split("_")[1]);

});

$("#plus_b").click(function () {
    $("#address_plus").append("<span id='label_input'><input type='text'/></span><br>");
});

$('#foto_b').on('click', function () {
    $('#choose_file').trigger('click');
});

$('#choose_file').on('click', function () {
    poi['url'] = "https://gruppodinterventogiuridicoweb.files.wordpress.com/2013/05/badesi-gru.jpg";
});

$(function () {
    $("#start_date").datepicker();
    $("#end_date").datepicker();
});


var via = {};
var via_array = [];

$.getJSON('via.json', function (data) {

    via = data;

    for (var j = 0; j < via.length; j++) {
        via_array.push(via[j].via);
    }


    $("#address_poi_via").autocomplete({
        source: via_array
    });
});


var cap = {};
var cap_array = [];

$.getJSON('cap.json', function (data) {

    cap = data;

    for (var k = 0; k < cap.length; k++) {
        cap_array.push(String(cap[k].cap));
    }


    $("#address_poi_cap").autocomplete({
        source: cap_array
    });
});


