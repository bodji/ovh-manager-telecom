angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.pack.xdsl.modem.dmz", {
        url: "/dmz",
        views: {
            "modemView@telecom.pack.xdsl.modem": {
                templateUrl: "app/telecom/pack/xdsl/modem/dmz/pack-xdsl-modem-dmz.html",
                controller: "XdslModemDmzCtrl",
                controllerAs: "DmzCtrl"
            }
        },
        translations: ["common", "telecom/pack/xdsl/modem/dmz"]
    });
});
