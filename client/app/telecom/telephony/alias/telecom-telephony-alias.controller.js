angular.module("managerApp").controller("TelecomTelephonyAliasCtrl", function ($q, $stateParams, $translate, $scope, TelephonyMediator, SidebarMenu, Toast) {
    "use strict";

    var self = this;

    self.loading = {
        init: false,
        save: false
    };

    self.number = null;
    self.links = null;
    self.terminationTask = null;
    self.serviceName = $stateParams.serviceName !== "default" ? $stateParams.serviceName : null;

    /* ==============================
    =            HELPERS            =
    =============================== */

    self.hasConsumption = function () {
        return ["redirect", "ddi", "conference", "svi"].indexOf(self.number.feature.featureType) === -1;
    };

    /* -----  End of HELPERS  ------ */

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.numberDescriptionSave = function (newServiceDescription) {
        self.number.startEdition();
        self.number.description = newServiceDescription;
        return self.number.save().then(function () {
            self.number.stopEdition();
            SidebarMenu.updateItemDisplay({
                title: self.number.getDisplayedName()
            }, self.number.serviceName, "telecom-telephony-section", self.number.billingAccount);
        }, function (error) {
            self.number.stopEdition(true);
            Toast.error([$translate.instant("telephony_alias_rename_error", $stateParams), error.data.message].join(" "));
            return $q.reject(error);
        });
    };

    /* -----  End of ACTIONS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.loading.init = true;
        TelephonyMediator.getGroup($stateParams.billingAccount).then(function (group) {
            self.number = group ? group.getNumber($stateParams.serviceName) : null;
            self.links = {
                order: TelephonyMediator.getV6ToV4RedirectionUrl("alias.number_order_new"),
                bank: TelephonyMediator.getV6ToV4RedirectionUrl("alias.number_bannMaker"),
                numberDirectory: TelephonyMediator.getV6ToV4RedirectionUrl("alias.number_manage_directory")
            };
            if (self.number) {
                return $q.all([
                    self.number.getTerminationTask().then(function (task) {
                        self.terminationTask = task;
                        $scope.terminationTask = task;
                    }),
                    self.number.getConvertToLineTask().then(function (task) {
                        self.convertTask = task;
                        $scope.convertTask = task;
                    }),
                    self.number.isSpecialNumber().then(function (result) {
                        self.isSpecialNumber = result;
                    })
                ]);
            }
            return null;
        }).finally(function () {
            self.loading.init = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();

});
