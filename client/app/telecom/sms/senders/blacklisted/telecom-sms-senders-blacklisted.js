angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.sms.senders.blacklisted", {
        url: "/blacklisted",
        views: {
            "@smsView": {
                templateUrl: "app/telecom/sms/senders/blacklisted/telecom-sms-senders-blacklisted.html",
                controller: "TelecomSmsSendersBlacklistedCtrl",
                controllerAs: "SmsSendersBlacklistedCtrl"
            }
        },
        translations: ["common", "telecom/sms/senders/blacklisted"]
    });
});
