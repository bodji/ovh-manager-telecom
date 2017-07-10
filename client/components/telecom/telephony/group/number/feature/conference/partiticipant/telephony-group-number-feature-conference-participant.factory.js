/**
 *  This factory manages the conference feature of a number.
 *  This manages the conference of /telephony/{billingAccount}/number API.
 */
angular.module("managerApp").factory("TelephonyGroupNumberConferenceParticipant", function (Telephony) {
    "use strict";

    /*= ==================================
    =            CONSTRUCTOR            =
    ===================================*/

    function TelephonyGroupNumberConferenceParticipant (participantOptionsParam) {
        var participantOptions = participantOptionsParam;

        // check for mandatory options
        if (!participantOptions) {
            participantOptions = {};
        }

        // check mandatory fields
        if (!participantOptions.billingAccount) {
            throw new Error("billingAccount option must be specified when creating a new TelephonyGroupNumberConferenceParticipant");
        }

        if (!participantOptions.serviceName) {
            throw new Error("serviceName option must be specified when creating a new TelephonyGroupNumberConferenceParticipant");
        }

        if (!participantOptions.id) {
            throw new Error("id option must be specified when creating a new TelephonyGroupNumberConferenceParticipant");
        }

        // set mandatory attributes
        this.billingAccount = participantOptions.billingAccount;
        this.serviceName = participantOptions.serviceName;
        this.id = participantOptions.id;

        // custom attributes
        this.inEdition = false;
        this.saveForEdition = null;
        this.energyEquivalence = null;

        // set feature options
        this.setInfos(participantOptions).setEnergyEquivalent();
    }

    /* -----  End of CONSTRUCTOR  ------*/

    /*= ========================================
    =            PROTOTYPE METHODS            =
    =========================================*/

    /* ----------  FEATURE OPTIONS  ----------*/

    TelephonyGroupNumberConferenceParticipant.prototype.setInfos = function (participantOptionsParam) {
        var self = this;
        var participantOptions = participantOptionsParam;

        if (!participantOptions) {
            participantOptions = {};
        }

        var optionsAttributes = ["energy", "talking", "speak", "callerNumber",
            "floor", "hear", "callerName", "arrivalDateTime"
        ];

        _.assign(self, _.pick(participantOptions, optionsAttributes));

        return self;
    };

    TelephonyGroupNumberConferenceParticipant.prototype.setEnergyEquivalent = function () {
        var self = this;

        switch (self.energy) {
        case 450:
            self.energyEquivalence = 1;
            break;
        case 150:
            self.energyEquivalence = 3;
            break;
        case 0:
            self.energyEquivalence = 4;
            break;
        default:
            self.energyEquivalence = 2; // because default energy is 300 (equivalence of 2)
        }

        return self;
    };

    /* ----------  API CALLS  ----------*/

    /**
     *  Mute a participant of a conference
     *
     *  @return {Promise} That return a Telephony Task
     */
    TelephonyGroupNumberConferenceParticipant.prototype.mute = function () {
        var self = this;

        return Telephony.Conference().Participants().Lexi().mute({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName,
            id: self.id
        }, {}).$promise;
    };

    /**
     *  Unmute a participant of a conference
     *
     *  @return {Promise} That return a Telephony Task
     */
    TelephonyGroupNumberConferenceParticipant.prototype.unmute = function () {
        var self = this;

        return Telephony.Conference().Participants().Lexi().unmute({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName,
            id: self.id
        }, {}).$promise;
    };

    /**
     *  Kick a participant of a conference
     *
     *  @return {Promise} That return a Telephony Task
     */
    TelephonyGroupNumberConferenceParticipant.prototype.kick = function () {
        var self = this;

        return Telephony.Conference().Participants().Lexi().kick({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName,
            id: self.id
        }, {}).$promise;
    };

    /**
     *  Deaf a participant of a conference
     *
     *  @return {Promise} That return a Telephony Task
     */
    TelephonyGroupNumberConferenceParticipant.prototype.deaf = function () {
        var self = this;

        return Telephony.Conference().Participants().Lexi().deaf({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName,
            id: self.id
        }, {}).$promise;
    };

    /**
     *  Undeaf a participant of a conference
     *
     *  @return {Promise} That return a Telephony Task
     */
    TelephonyGroupNumberConferenceParticipant.prototype.undeaf = function () {
        var self = this;

        return Telephony.Conference().Participants().Lexi().undeaf({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName,
            id: self.id
        }, {}).$promise;
    };

    /**
     *  Change energy from a participant of a conference
     *
     *  @return {Promise} That return a Telephony Task
     */
    TelephonyGroupNumberConferenceParticipant.prototype.updateEnergy = function (value) {
        var self = this;

        return Telephony.Conference().Participants().Lexi().energy({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName,
            id: self.id
        }, {
            value: value
        }).$promise;
    };

    /* -----  End of PROTOTYPE METHODS  ------*/

    return TelephonyGroupNumberConferenceParticipant;

});
