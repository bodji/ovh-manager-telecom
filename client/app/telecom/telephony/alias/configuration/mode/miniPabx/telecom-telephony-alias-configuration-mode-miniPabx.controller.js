angular.module("managerApp").controller("TelecomTelephonyAliasConfigurationModeMiniPabxCtrl", function ($q, $translate, $stateParams, TelephonyMediator, OvhApiTelephony, OvhApiTelephonyMiniPabx, Toast) {
    "use strict";

    var self = this;

    self.loading = {
        init: false,
        save: false
    };

    self.number = null;
    self.enums = null;
    self.options = null;
    self.formOptions = null;

    /* ==============================
    =            HELPERS            =
    =============================== */

    function fetchEnums () {
        return OvhApiTelephony.v6().schema().$promise.then(function (result) {
            var enums = {};
            var tmpPatternEnum = _.get(result, ["models", "telephony.EasyMiniPabxHuntingPatternEnum", "enum"]);
            enums.pattern = _.filter(tmpPatternEnum, function (pattern) {
                return pattern !== "all-at-once";
            });
            enums.strategy = _.get(result, ["models", "telephony.EasyMiniPabxHuntingStrategyEnum", "enum"]);
            return enums;
        });
    }

    function fetchHunting () {
        return OvhApiTelephonyMiniPabx.v6().getHunting({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise;
    }

    self.hasChanges = function () {
        return !angular.equals(self.options, self.formOptions);
    };

    /* -----  End of HELPERS  ------ */

    /* =============================
    =            EVENTS            =
    ============================== */

    self.onOptionsFormSubmit = function () {
        var attrs = ["anonymousCallRejection", "numberOfCalls", "pattern", "strategy", "onHoldTimer"];

        self.loading.save = true;

        return OvhApiTelephonyMiniPabx.v6().updateHunting({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }, _.pick(self.formOptions, attrs)).$promise.then(function () {
            self.options = angular.copy(self.formOptions);
            Toast.success($translate.instant("telephony_alias_configuration_mode_mini_pabx_save_success"));
        }).catch(function (error) {
            Toast.error([$translate.instant("telephony_alias_configuration_mode_mini_pabx_save_error"), _.get(error, "data.message")].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.loading.save = false;
        });
    };

    self.onCancelBtnClick = function () {
        self.formOptions = angular.copy(self.options);
    };

    /* -----  End of EVENTS  ------ */

    /* =====================================
    =            INITIALIZATION            =
    ====================================== */

    self.$onInit = function () {
        self.loading.init = true;

        return TelephonyMediator.getGroup($stateParams.billingAccount).then(function (group) {
            self.number = group.getNumber($stateParams.serviceName);

            return self.number.feature.init().then(function () {
                return $q.all({
                    enums: fetchEnums(),
                    hunting: fetchHunting()
                }).then(function (result) {
                    self.enums = result.enums;
                    self.options = result.hunting;
                    self.formOptions = angular.copy(result.hunting);
                    self.voicemail = result.voicemail;
                });
            });
        }).catch(function (error) {
            Toast.error([$translate.instant("telephony_alias_configuration_mode_mini_pabx_loading_error"), _.get(error, "data.message")].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.loading.init = false;
        });
    };

    /* -----  End of INITIALIZATION  ------ */

});
