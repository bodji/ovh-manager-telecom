angular.module("managerApp").controller("TelecomTelephonyLineConsumptionIncomingFaxCtrl", function ($stateParams, $q, $translate, $filter, $timeout, OvhApiTelephony, ToastError) {
    "use strict";

    var self = this;

    function fetchIncomingConsumption () {
        return OvhApiTelephony.Service().FaxConsumption().v6().query({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise.then(function (ids) {
            return $q.all(_.map(_.chunk(ids, 50), function (chunkIds) {
                return OvhApiTelephony.Service().FaxConsumption().v6().getBatch({
                    billingAccount: $stateParams.billingAccount,
                    serviceName: $stateParams.serviceName,
                    consumptionId: chunkIds
                }).$promise;
            })).then(function (chunkResult) {
                return _.flatten(chunkResult);
            });
        }).then(function (resultParam) {
            var result = _.pluck(resultParam, "value");
            result = _.filter(result, function (conso) {
                return conso.wayType === "received";
            });
            return result;
        });
    }

    function init () {

        self.consumption = {
            raw: null,
            sorted: null,
            paginated: null,
            selected: null,
            pagesSum: 0,
            isLoading: false,
            orderBy: "creationDatetime",
            orderDesc: true,
            filterBy: {
                calling: undefined
            },
            showFilter: false
        };

        self.period = {
            start: moment().startOf("month"),
            end: moment().endOf("month")
        };

        self.consumption.isLoading = true;
        fetchIncomingConsumption().then(function (result) {
            self.consumption.raw = angular.copy(result);
            self.applySorting();
            self.consumption.pagesSum = _.sum(self.consumption.raw, function (conso) {
                return conso.pages;
            });
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.consumption.isLoading = false;
        });
    }

    self.refresh = function () {
        OvhApiTelephony.Service().FaxConsumption().v6().resetCache();
        OvhApiTelephony.Service().FaxConsumption().v6().resetQueryCache();
        init();
    };

    self.applySorting = function () {
        var data = angular.copy(self.consumption.raw);
        data = $filter("filter")(data, self.consumption.filterBy);
        data = $filter("orderBy")(
            data,
            self.consumption.orderBy,
            self.consumption.orderDesc
        );
        self.consumption.sorted = data;
    };

    self.toggleShowFilter = function () {
        self.consumption.showFilter = !self.consumption.showFilter;
        self.consumption.filterBy = {
            calling: undefined
        };
        self.applySorting();
    };

    self.orderBy = function (by) {
        if (self.consumption.orderBy === by) {
            self.consumption.orderDesc = !self.consumption.orderDesc;
        } else {
            self.consumption.orderBy = by;
        }
        self.applySorting();
    };

    init();
});
