angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.alias.configuration.tones", {
        url: "/tones",
        "abstract": true
    });
});
