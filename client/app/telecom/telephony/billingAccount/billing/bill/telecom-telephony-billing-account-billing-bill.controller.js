angular.module("managerApp").controller("TelecomTelephonyBillingAccountBillingBillCtrl", function ($stateParams, $filter, $q, $timeout, $window, OvhApiTelephony, ToastError) {
    "use strict";

    const self = this;

    function fetchConsumption () {
        return OvhApiTelephony.HistoryConsumption().Lexi().query({
            billingAccount: $stateParams.billingAccount
        }).$promise.then(function (ids) {
            return $q.all(_.map(_.chunk(ids, 50), function (chunkIds) {
                return OvhApiTelephony.HistoryConsumption().Lexi().getBatch({
                    billingAccount: $stateParams.billingAccount,
                    date: chunkIds
                }).$promise;
            })).then(function (chunkResult) {
                const result = _.pluck(_.flatten(chunkResult), "value");
                return _.each(result, function (consumption) {
                    consumption.priceValue = consumption.price ? consumption.price.value : null;
                });
            });
        });
    }


    this.$onInit = function () {
        self.consumption = {
            raw: null
        };
        self.refresh();
    };

    self.refresh = function () {
        fetchConsumption().then(function (result) {
            self.consumption.raw = result;
        }).catch(function (err) {
            return new ToastError(err);
        });
    };

    self.fetchFile = function (consumption, type) {
        const tryDownload = function () {
            return OvhApiTelephony.HistoryConsumption().Lexi().getFile({
                billingAccount: $stateParams.billingAccount,
                date: consumption.date,
                extension: type
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

    self.download = function (consumption, type) {
        consumption.downloading = true;
        self.fetchFile(consumption, type).then(function (info) {
            $window.location.href = info.url;
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            consumption.downloading = false;
        });
    };

});
