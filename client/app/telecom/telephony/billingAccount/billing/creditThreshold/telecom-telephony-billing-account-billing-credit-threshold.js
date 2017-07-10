angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.creditThreshold", {
        url: "/creditThreshold",
        views: {
            groupView: {
                templateUrl: "app/telecom/telephony/billingAccount/billing/creditThreshold/telecom-telephony-billing-account-billing-credit-threshold.html",
                controller: "TelecomTelephonyBillingAccountBillingCreditThresholdCtrl",
                controllerAs: "BillingAccountCreditThresholdCtrl"
            }
        },
        translations: ["common"]
    });
});
