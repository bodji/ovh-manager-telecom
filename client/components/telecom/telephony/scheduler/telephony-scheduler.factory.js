/**
 *  Describe a telephony scheduler item.
 *
 *  @constructor
 *  @param  {Object} options Options for creating a new VoipScheduler.
 *  @param  {String} options.billingAccount Billing account of the scheduler.
 *  @param  {String} options.serviceName Service name of the scheduler.
 *  @param  {String} options.timeZone Current time zone ot the scheduler.
 */
angular.module("managerApp").factory("VoipScheduler", function ($q, OvhApiTelephony, VoipSchedulerEvent) {
    "use strict";

    /*= ==================================
    =            CONSTRUCTOR            =
    ===================================*/

    function VoipScheduler (optionsParam) {
        var options = optionsParam || {};

        // options check
        if (!options.billingAccount) {
            throw new Error("billingAccount option must be specified when creating a new VoipScheduler");
        }
        if (!options.serviceName) {
            throw new Error("serviceName option must be specified when creating a new VoipScheduler");
        }

        // mandatory
        this.billingAccount = options.billingAccount;
        this.serviceName = options.serviceName;

        // from api
        this.setOptions(options);

        // custom attributes
        this.events = [];
        this.inEdition = false;
        this.saveForEdition = null;
    }

    /* -----  End of CONSTRUCTOR  ------*/

    /*= ========================================
    =            PROTOTYPE METHODS            =
    =========================================*/

    /* ----------  HELPERS  ----------*/

    /**
     *  Bind API informations to scheduler instance.
     *
     *  @param {Object} options New options of the scheduler instance. See constructor for details.
     *
     *  @return {VoipScheduler} The current scheduler instance.
     */
    VoipScheduler.prototype.setOptions = function (options) {
        var self = this;

        if (!options) {
            return self;
        }

        self.timeZone = options.timeZone;

        return self;
    };

    /* ----------  API CALLS  ----------*/

    /**
     *  Get the informations about scheduler. Make a call to GET /telephony/{billingAccount}/scheduler/{serviceName} API.
     *
     *  @return {Promise} That returns the current scheduler instance when resolved.
     */
    VoipScheduler.prototype.get = function () {
        var self = this;

        return OvhApiTelephony.Scheduler().v6().get({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName
        }).$promise.then(function (schedulerOptions) {
            return self.setOptions(schedulerOptions);
        });
    };

    /**
     *  Save scheduler. Save its options and its events. Make call to PUT /telephony/{billingAccount}/scheduler/{serviceName} API.
     *
     *  @return {Promise} That returns the current scheduler instance when resolved.
     */
    VoipScheduler.prototype.save = function () {
        var self = this;
        var promises = [];
        var deletePromises = [];

        if (self.hasChange("timeZone")) {
            promises.push(OvhApiTelephony.Scheduler().v6().save({
                billingAccount: self.billingAccount,
                serviceName: self.serviceName
            }, {
                timeZone: self.timeZone
            }).$promise);
        }

        // save changed events
        _.chain(self.events).filter(function (event) {
            return event.status === "TOCREATE" || event.hasChange(null, true);
        }).forEach(function (event) {
            if (event.status === "TODELETE") {
                deletePromises.push(event.remove().then(function () {
                    // when delete done, remove from event list
                    self.removeEvent(event);
                }));
            } else if (event.status === "TOCREATE") {
                promises.push(event.create().then(function (createdEvent) {
                    createdEvent.stopEdition().status = "OK";
                }));
            } else {
                promises.push(event.save().then(function (editedEvent) {
                    editedEvent.stopEdition();
                }));
            }
        }).value();

        // first delete events that needs to be deleted - to avoid time conflicts with categories
        // then save others
        return $q.allSettled(deletePromises).then(function () {
            return $q.allSettled(promises).then(function () {
                return self;
            });
        });
    };

    VoipScheduler.prototype.importIcsCalendar = function (calendarUrl) {
        var self = this;

        return OvhApiTelephony.Scheduler().v6().importIcsCalendar({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName
        }, {
            url: calendarUrl
        }).$promise;
    };

    /* ----------  EVENTS  ----------*/

    /**
     *  Get the scheduler events. Make a call to GET /telephony/{billingAccount}/scheduler/{serviceName}/events and GET /telephony/{billingAccount}/scheduler/{serviceName}/events/{uid} APIs.
     *
     *  @param  {Object} filters Filters to add when calling GET /telephony/{billingAccount}/scheduler/{serviceName}/events. See API call parameters for more informations.
     *
     *  @return {Promise} That returns the founded scheduler events.
     */
    VoipScheduler.prototype.getEvents = function (filters) {
        var self = this;

        return OvhApiTelephony.Scheduler().Events().v6().query(angular.extend({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName
        }, filters || {})).$promise.then(function (eventIds) {
            return $q.all(_.map(_.chunk(eventIds, 50), function (chunkIds) {
                return OvhApiTelephony.Scheduler().Events().v6().getBatch({
                    billingAccount: self.billingAccount,
                    serviceName: self.serviceName,
                    uid: chunkIds
                }).$promise;
            })).then(function (chunkResult) {
                _.chain(chunkResult).flatten().pluck("value").filter(function (event) {
                    return !_.find(self.events, {
                        uid: event.uid
                    });
                })
                    .forEach(function (eventOptions) {
                        self.addEvent(eventOptions);
                    })
                    .value();

                return self.events;
            });
        });
    };

    /**
     *  Add an event to events list.
     *
     *  @param {Obejct|VoipSchedulerEvent} eventOptions The options of the new scheduler event or the scheduler event instance to add.
     *
     *  @return {VoipSchedulerEvent} The added scheduler event.
     */
    VoipScheduler.prototype.addEvent = function (eventOptions) {
        var self = this;
        var event;

        if (eventOptions instanceof VoipSchedulerEvent) {
            event = eventOptions;
        } else {
            event = new VoipSchedulerEvent(angular.extend({
                billingAccount: self.billingAccount,
                serviceName: self.serviceName
            }, eventOptions));
        }

        self.events.push(event);

        return event;
    };

    /**
     *  Remove a scheduler event from events list by using its uid attribute.
     *
     *  @param  {VoipSchedulerEvent} event The event to remove from events list.
     *
     *  @return {VoipScheduler} Current instance of the scheduler.
     */
    VoipScheduler.prototype.removeEvent = function (event) {
        var self = this;

        _.remove(self.events, {
            uid: event.uid
        });

        return self;
    };

    /**
     *  Get a scheduler event using its uid attribute.
     *
     *  @param  {String} eventUid The unique uid of the scheduler event to find in events list.
     *
     *  @return {VoipSchedulerEvent} The founded scheduler event in scheduler events list. Undefined if not found.
     */
    VoipScheduler.prototype.getEventByUid = function (eventUid) {
        var self = this;

        return _.find(self.events, {
            uid: eventUid
        });
    };

    /**
     *  Check if an event of given category is already present in a date range.
     *
     *  @param  {VoipSchedulerEvent|Object}  event An VoipSchedulerEvent instance or an Object with at least the following attribute setted : categories, dateStart & dateEnd.
     *
     *  @return {Boolean} true if an event of the same category is found in the event range, false otherwise.
     */
    VoipScheduler.prototype.isEventInExistingRange = function (event) {
        var self = this;

        return _.some(self.events, function (schedulerEvent) {
            return _.isEqual(schedulerEvent.categories, event.categories) &&
                   (moment(schedulerEvent.dateStart).isBetween(event.dateStart, event.dateEnd, null, "[]") || moment(schedulerEvent.dateEnd).isBetween(event.dateStart, event.dateEnd, null, "[]"));
        });
    };

    /* ----------  TASK  ----------*/

    VoipScheduler.prototype.getPendingImportTasks = function () {
        var self = this;

        var getImportTask = function (status) {
            return OvhApiTelephony.Service().Task().v6().query({
                billingAccount: self.billingAccount,
                serviceName: self.serviceName,
                action: "importIcs",
                serviceType: "scheduler",
                status: status
            });
        };

        return $q.all({
            doing: getImportTask("doing"),
            todo: getImportTask("todo")
        }).then(function (responses) {
            return responses.doing.concat(responses.todo);
        });
    };

    /* ----------  ICS EXPORT  ----------*/

    VoipScheduler.prototype.exportToIcs = function (categoryFilter) {
        var self = this;

        var makeIcsHeader = function () {
            return ["BEGIN:VCALENDAR", "PRODID:OVH Calendar", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"].join("\n") + "\n";
        };

        var makeIcsContent = function () {
            var icsEvents = [];
            var filteredEvents = _.filter(self.events, function (event) {
                return categoryFilter.indexOf(event.categories) === -1;
            });

            angular.forEach(filteredEvents, function (event) {
                icsEvents.push(event.toIcsVEvent(self.timeZone));
            });

            return icsEvents.join("\n") + "\n";
        };

        var makeIcsFooter = function () {
            return "END:VCALENDAR";
        };

        return makeIcsHeader() + makeIcsContent() + makeIcsFooter();
    };

    /* ----------  EDITION  ----------*/

    /**
     *  Start scheduler edition. Copy the current options into a temp object.
     *
     *  @return {VoipScheduler} The current scheduler instance.
     */
    VoipScheduler.prototype.startEdition = function () {
        var self = this;

        self.inEdition = true;

        self.saveForEdition = {
            timeZone: angular.copy(self.timeZone)
        };

        return self;
    };

    /**
     *  Stop scheduler edition. Reset copied scheduler options.
     *
     *  @param  {Boolean} cancel Flag telling to reset or not scheduler attributes to old values.
     *
     *  @return {VoipScheduler} The current scheduler instance.
     */
    VoipScheduler.prototype.stopEdition = function (cancel, resetEvents, rollBackToOriginalEvents) {
        var self = this;

        if (self.saveForEdition && cancel) {
            self.timeZone = angular.copy(self.saveForEdition.timeZone);
        }

        // remove events that are to be created
        _.filter(self.events, {
            status: "TOCREATE"
        }).forEach(function (event) {
            // remove from events list
            self.removeEvent(event);
        });

        // reset events to their original values
        angular.forEach(self.events, function (event) {
            event.stopEdition(cancel, rollBackToOriginalEvents).status = "OK";
            if (resetEvents) {
                event.resetOriginalSave();
            }
        });

        self.saveForEdition = null;
        self.inEdition = false;

        return self;
    };

    /**
     *  Check if changes have been made to scheduler instance.
     *
     *  @param  {String}  property Property to check for change. If not defined, check the hole scheduler instance properties.
     *
     *  @return {Boolean}   true if at least one change has been found, false if no changes.
     */
    VoipScheduler.prototype.hasChange = function (property) {
        var self = this;

        if (!self.saveForEdition) {
            return false;
        }

        if (property) {
            switch (property) {
            case "timeZone":
                return !_.isEqual(self.timeZone, self.saveForEdition.timeZone);
            case "events":
                // check if one of the event has changed
                return !!_.find(self.events, function (event) {
                    return event.status === "TOCREATE" || event.hasChange(null, true);
                });
            default:
                return false;
            }
        } else {
            return self.hasChange("timeZone") || self.hasChange("events");
        }
    };

    /* -----  End of PROTOTYPE METHODS  ------*/

    return VoipScheduler;

});
