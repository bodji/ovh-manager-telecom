angular.module("managerApp").controller("telephonyBulkActionModalCtrl", function ($http, $filter, $q, $translate, $uibModalInstance, modalBindings, telecomVoip) {
    "use strict";

    var self = this;
    var allServices;

    self.loading = {
        init: false,
        bulk: false
    };

    self.model = {
        billingAccount: null,
        searchService: "",
        selection: {}
    };

    self.state = {
        selectAll: false
    };

    self.bindings = null;
    self.billingAccounts = null;
    self.serviceList = null;

    /* ==============================
    =            HELPERS            =
    =============================== */

    function getFilteredServiceList () {
        var services = null;

        if (!self.model.billingAccount) {
            services = allServices;
        } else {
            services = _.filter(allServices, {
                billingAccount: self.model.billingAccount
            });
        }

        if (self.model.searchService !== "") {
            return $filter("propsFilter")(services, {
                serviceName: self.model.searchService,
                description: self.model.searchService
            });
        }

        return services;
    }

    self.getSelectedCount = function () {
        var count = 0;

        _.keys(self.model.selection).forEach(function (serviceName) {
            count += _.get(self.model.selection, serviceName) === true ? 1 : 0;
        });

        return count;
    };

    self.getSelectedServices = function () {
        var selectedServices = [];

        _.keys(self.model.selection).forEach(function (serviceName) {
            if (self.model.selection[serviceName] === true && self.bindings.serviceName !== serviceName) {
                selectedServices.push({
                    billingAccount: _.find(allServices, {
                        serviceName: serviceName
                    }).billingAccount,
                    serviceName: serviceName
                });
            }
        });

        return selectedServices;
    };

    /*
     * Highlight services on which a previous succesful bulk action had been made
     */
    self.highlightUpdatedServices = function (services) {
        _.forEach(services, function (service) {
            _.forEach(self.billingAccounts, function (billingAccount) {
                var findService = _.find(billingAccount.services, "serviceName", service.serviceName);
                if (findService) {
                    findService.hasUpdate = true;
                }
            });
        });
    };

    /* -----  End of HELPERS  ------ */


    /* =============================
    =            EVENTS            =
    ============================== */

    self.cancel = function (reason) {
        return $uibModalInstance.dismiss(reason);
    };

    self.onBillingAccountSelectChange = function () {
        self.state.selectAll = false;
        self.serviceList = getFilteredServiceList();
    };

    self.onToggleAllCheckStateBtnClick = function () {
        self.state.selectAll = !self.state.selectAll;
        self.serviceList.forEach(function (service) {
            if (service.serviceName !== self.bindings.serviceName) {
                _.set(self.model.selection, service.serviceName, self.state.selectAll);
            }
        });
    };

    self.onSearchServiceInputChange = function () {
        self.state.selectAll = false;
        self.serviceList = getFilteredServiceList();
    };

    self.onBulkServiceChoiceFormSubmit = function () {
        self.loading.bulk = true;

        // build params for each actions
        if (self.bindings.getBulkParams && _.isFunction(self.bindings.getBulkParams())) {
            self.bindings.bulkInfos.actions.forEach(function (info) {
                info.params = self.bindings.getBulkParams()(info.name);
            });
        }

        // call 2API endpoint
        return $http.post("/" + ["telephony", self.bindings.billingAccount, "service", self.bindings.serviceName, "bulk"].join("/"), {
            bulkInfos: self.bindings.bulkInfos,
            bulkServices: self.getSelectedServices()
        }, {
            serviceType: "aapi"
        }).then(function (result) {
            var partitionedResult = _.partition(result.data, function (res) {
                return res.errors.length === 0;
            });

            return $uibModalInstance.close({
                success: _.first(partitionedResult),
                error: _.last(partitionedResult)
            });
        }).catch(function (error) {
            return self.cancel({
                type: "API",
                msg: error
            });
        }).finally(function () {
            self.loading.bulk = false;
        });
    };

    /* -----  End of EVENTS  ------ */

    /* =====================================
    =            INITIALIZATION            =
    ====================================== */

    function completeServiceListDetails () {
        // filter service with the modal filters
        self.serviceList = getFilteredServiceList();

        // set current serviceName as selected
        _.set(self.model.selection, self.bindings.serviceName, true);

        if (self.bindings.previouslyUpdatedServices.length > 0) {
            self.highlightUpdatedServices(self.bindings.previouslyUpdatedServices);
        }
    }

    self.$onInit = function () {
        self.loading.init = true;

        self.bindings = modalBindings;
        self.model.billingAccount = self.bindings.billingAccount;

        return telecomVoip.fetchAll(false).then(function (billingAccounts) {
            self.billingAccounts = _.sortBy(billingAccounts, function (billingAccount) {
                return billingAccount.getDisplayedName();
            });

            // get all services of each billingAccounts and apply a first filter based on serviceType
            allServices = _.chain(self.billingAccounts).map("services").flatten().filter(function (service) {
                return self.bindings.serviceType === "all" || service.serviceType === self.bindings.serviceType;
            }).value();

            if (self.bindings.filterServices && _.isFunction(self.bindings.filterServices())) {
                allServices = self.bindings.filterServices()(allServices);
                var filterPromise = _.isFunction(allServices.then) ? allServices : $q.when(allServices);

                filterPromise.then((filteredServices) => {
                    allServices = filteredServices;
                    completeServiceListDetails();
                    self.loading.init = false;
                });

            } else {
                completeServiceListDetails();
                self.loading.init = false;
            }
        });
    };

    /* -----  End of INITIALIZATION  ------ */

});
