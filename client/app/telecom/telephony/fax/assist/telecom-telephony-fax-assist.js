angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.fax.assist", {
        url: "/assist",
        views: {
            faxInnerView: {
                templateUrl: "app/telecom/telephony/fax/assist/telecom-telephony-fax-assist.html",
                controller: "TelecomTelephonyFaxAssistCtrl",
                controllerAs: "$ctrl"
            }
        },
        translations: [
            "common",
            "telecom/telephony/fax",
            "telecom/telephony/fax/assist"
        ]
    });
});
