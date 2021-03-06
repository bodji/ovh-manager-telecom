"use strict";

describe("Controller: XdslModemManagedByCtrl", function () {
    // load the controller"s module
    beforeEach(angular.mock.module("managerAppMock"));
    var dataTest = readJSON("client/bower_components/ovh-api-services/src/xdsl/modem/xdsl-modem.service.dt.spec.json");

    var $httpBackend;
    var $rootScope;
    var $controller;
    var $scope;
    var PackXdslModemMediator;

    beforeEach(inject(function (_$httpBackend_, _$rootScope_, _$controller_, $injector, _PackXdslModemMediator_) {
        /** * APIv6 Auth ***/
        var authentication;
        authentication = $injector.get("ssoAuthentication");
        authentication.setIsLoggedIn(true);

        /******************/

        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        $controller = _$controller_;
        PackXdslModemMediator = _PackXdslModemMediator_;

        $httpBackend.whenGET(/translations\/Messages\w+\.json$/).respond(200, {});
        $httpBackend.whenGET("/apiv6/me").respond(200, {});
        $httpBackend.whenGET("/apiv6/me/paymentMean/creditCard").respond(200, []);
        $httpBackend.whenGET("/apiv6/me/paymentMean/paypal").respond(200, []);
        $httpBackend.whenGET("/apiv6/me/paymentMean/bankAccount?state=valid").respond(200, []);
        $httpBackend.whenGET("/2api/me/ovhAccount/all").respond(200, []);
        $httpBackend.whenGET("app/home/home.html").respond(200, {});

        $scope = $rootScope.$new();
    }));

    afterEach(inject(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
        $scope.$destroy();
    }));

    //-----

    var XdslModemManagedByCtrl;
    var xdslPack = "xdsl-ja7736-3";

    function initNewCtrl (pack) {
        $controller("XdslModemCtrl", {
            $scope: $scope,
            $stateParams: { serviceName: pack }
        });

        $httpBackend.whenGET("/apiv6/xdsl/" + xdslPack).respond(200, {});
        $httpBackend.whenGET("/apiv6/xdsl/" + xdslPack + "/modem").respond(200, dataTest.modem);
        $httpBackend.whenGET("/2api/xdsl/" + xdslPack + "/modem/tasks").respond(200, dataTest.tasks.success);
        XdslModemManagedByCtrl = $controller("XdslModemManagedByCtrl", {
            $scope: $scope,
            $stateParams: { serviceName: pack }
        });
    }

    //-----

    describe("- Managed By -", function () {

        beforeEach(function () {
            $httpBackend.whenPUT("/apiv6/xdsl/" + xdslPack + "/modem").respond(201, null);
            initNewCtrl(xdslPack);
        });

        it("activate the bridge Mode", function () {
            PackXdslModemMediator.info.managedByOvh = true;
            XdslModemManagedByCtrl.changeManagedBy();
            expect(PackXdslModemMediator.tasks.changeModemConfigManagement).toBe(true);
            $httpBackend.flush();
        });

    });

});
