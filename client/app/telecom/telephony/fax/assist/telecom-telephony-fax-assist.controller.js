angular.module("managerApp").controller("TelecomTelephonyFaxAssistCtrl", function ($q, $stateParams, $translate, TelephonyMediator, Toast) {
    "use strict";

    var self = this;

    self.loading = {
        init: false
    };

    self.fax = null;
    self.actions = null;

    /* =====================================
    =            INITIALIZATION            =
    ====================================== */

    function initActions () {
        var actions = [{
            name: "fax_assist_logs",
            sref: "telecom.telephony.fax.assist.logs",
            text: $translate.instant("telephony_group_fax_assist_action_logs")
        }, {
            name: "fax_assist_logs",
            sref: "telecom.telephony.fax.assist.support",
            main: true,
            picto: "ovh-font-docs",
            text: $translate.instant("telephony_group_fax_assist_action_support")
        }, {
            name: "fax_assist_orders",
            sref: "telecom.telephony.fax.assist.orders",
            text: $translate.instant("telephony_group_fax_assist_action_orders")
        }];

        self.actions = actions;
    }

    self.$onInit = function () {
        self.loading.init = true;

        return TelephonyMediator.getGroup($stateParams.billingAccount).then(function (group) {
            self.fax = group.getFax($stateParams.serviceName);
            initActions();
        }).catch(function (error) {
            Toast.error([$translate.instant("telephony_fax_loading_error"), _.get(error, "data.message", "")].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.loading.init = false;
        });
    };

    /* -----  End of INITIALIZATION  ------ */

});
