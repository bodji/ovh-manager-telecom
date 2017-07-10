angular.module("ovhPassword", []).directive("ovhPassword", function () {
    "use strict";

    return {
        restrict: "EA",
        scope: {
            ovhPwd: "=",
            ovhPwdConfirm: "="
        },
        replace: true,
        templateUrl: "components/ovh-password/ovh-password.html",
        link: function ($scope) {
            // We use an isolate scope, so define here some properties.
            $scope.password = {};
            $scope.password.value = $scope.ovhPwd;
            $scope.password.confirm = $scope.ovhPwdConfirm;

            $scope.$watch("password.value", function (newValue) {
                $scope.ovhPwd = newValue;
            });

            $scope.$watch("password.confirm", function (newValue) {
                $scope.ovhPwdConfirm = newValue;
            });
        }
    };

});

angular.module("managerApp").config(function ($ovhpopoverProvider) {
    "use strict";

    angular.extend($ovhpopoverProvider.defaults, {
        animation: "flat-fade"
    });
});
