angular.module("managerApp").controller("PackVoipEcoFaxCtrl", function ($scope, PackXdslVoipEcofax, $stateParams, REDIRECT_URLS) {
    "use strict";

    var self = this;

    var init = function init () {

        self.details = $scope.service;
        self.services = [];

        $scope.loaders = {
            services: true
        };

        // Get service link to this access from current Pack Xdsl
        return PackXdslVoipEcofax.Lexi().query({
            packId: $stateParams.packName
        }).$promise.then(
            function (services) {
                angular.forEach(services, function (service) {
                    self.services.push(service);
                });

                $scope.loaders.services = false;
            },
            function () {
                $scope.loaders.services = false;
            }
        );
    };

    self.generateV3Url = function (service) {
        // Build link to manager v3 for fax
        return REDIRECT_URLS.telephony.replace("{line}", service);
    };

    init();

}
);
