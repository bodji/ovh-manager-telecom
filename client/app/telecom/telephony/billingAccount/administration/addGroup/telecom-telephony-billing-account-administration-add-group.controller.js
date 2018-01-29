angular.module("managerApp").controller("TelecomTelephonyBillingAccountAdministrationAddGroup", function ($stateParams, $translate, $timeout, OvhApiOrderTelephony, ToastError) {
    "use strict";

    const self = this;

    function init () {
        self.loading = true;
        self.contractsAccepted = false;
        self.order = null;
        OvhApiOrderTelephony.Lexi().getNewBillingAccount().$promise.then(function (result) {
            self.contracts = result.contracts;
            self.prices = result.prices;
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.loading = false;
        });
    }

    self.getDisplayedPrice = function () {
        if (_.has(self, "prices.withTax.value") && self.prices.withTax.value === 0) {
            return $translate.instant("telephony_add_group_free");
        }
        return _.get(self, "a.b.c", "prices.withTax.text", "-");

    };

    self.orderGroup = function () {
        self.ordering = true;
        return OvhApiOrderTelephony.Lexi().orderNewBillingAccount().$promise.then(function (order) {
            self.order = order;
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.ordering = false;
        });
    };

    init();
});
