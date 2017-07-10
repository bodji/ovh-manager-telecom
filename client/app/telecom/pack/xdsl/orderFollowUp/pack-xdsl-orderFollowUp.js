angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.pack.xdsl.access-order", {
        url: "/order",
        views: {
            accessView: {
                templateUrl: "app/telecom/pack/xdsl/orderFollowUp/pack-xdsl-orderFollowUp.html"
            },
            "@followUp": {
                templateUrl: "app/telecom/pack/xdsl/orderFollowUp/pack-xdsl-orderFollowUp-main.view.html",
                controller: "XdslOrderFollowUpCtrl",
                controllerAs: "OrderFollowUpCtrl"
            }
        },
        translations: ["common", "telecom/pack/xdsl/orderFollowUp", "telecom/pack/common"]
    });
});

