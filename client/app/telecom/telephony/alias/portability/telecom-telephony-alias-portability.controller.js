angular.module("managerApp").controller("TelecomTelephonyAliasPortabilityCtrl", function ($translate) {
    "use strict";

    var self = this;

    self.actions = null;

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.actions = [{
            name: "number_portability_order",
            sref: "telecom.telephony.portabilityOrder",
            text: $translate.instant("telephony_alias_portability_actions_number_portability_order")
        }, {
            name: "number_portability_status",
            sref: "telecom.telephony.alias.portabilities",
            text: $translate.instant("telephony_alias_portability_actions_number_portability_status")
        }];
    }

    /* -----  End of INITIALIZATION  ------*/

    init();

});
