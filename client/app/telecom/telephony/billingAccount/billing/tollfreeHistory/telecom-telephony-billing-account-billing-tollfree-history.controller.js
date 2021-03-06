angular.module("managerApp").controller("TelecomTelephonyBillingAccountBillingTollfreeHistoryCtrl", function ($q, $filter, $window, $timeout, $stateParams, $translate, TelephonyMediator, OvhApiTelephony, Toast) {
    "use strict";

    var self = this;

    self.group = null;
    self.consumptionData = null;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    function fetchHistory () {
        return OvhApiTelephony.HistoryTollfreeConsumption().v6().query({
            billingAccount: $stateParams.billingAccount
        }).$promise.then(function (dates) {
            return $q.all(_.map(_.chunk(dates, 50), function (chunkDates) {
                return OvhApiTelephony.HistoryTollfreeConsumption().v6().getBatch({
                    billingAccount: $stateParams.billingAccount,
                    date: chunkDates
                }).$promise;
            })).then(function (chunkResult) {
                var result = _.pluck(_.flatten(chunkResult), "value");
                return _.each(result, function (consumption) {
                    consumption.priceValue = consumption.price ? consumption.price.value : null;
                });
            });
        }).catch(function (err) {
            self.consumptionData = [];
            Toast.error([$translate.instant("telephony_group_billing_tollfree_history_download_error"), (err.data && err.data.message) || ""].join(" "));
            return $q.reject(err);
        });
    }

    self.fetchFile = function (consumption) {
        var tryDownload = function () {
            return OvhApiTelephony.HistoryTollfreeConsumption().v6().getDocument({
                billingAccount: $stateParams.billingAccount,
                date: consumption.date
            }).$promise.then(function (info) {
                if (info.status === "error") {
                    return $q.reject({
                        statusText: "Unable to download message"
                    });
                } else if (info.status === "done") {
                    return $q.when(info);
                }

                // file is not ready to download, just retry
                return $timeout(tryDownload, 1000);
            });
        };
        return tryDownload();
    };

    /* -----  End of HELPERS  ------*/

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.download = function (consumption) {
        return self.fetchFile(consumption).then(function (info) {
            $window.location.href = info.url;
        }).catch(function (err) {
            Toast.error([$translate.instant("telephony_group_billing_tollfree_history_download_error"), (err.data && err.data.message) || ""].join(" "));
            return $q.reject(err);
        });
    };

    /* -----  End of ACTIONS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    this.$onInit = function () {
        return TelephonyMediator.getGroup($stateParams.billingAccount).then(function (group) {
            self.group = group;
            return fetchHistory().then(function (consumptions) {
                self.consumptionData = consumptions;
            });
        }).catch(function (err) {
            Toast.error([$translate.instant("telephony_group_billing_tollfree_history_init_error"), (err.data && err.data.message) || ""].join(" "));
            return $q.reject(err);
        });
    };

});
