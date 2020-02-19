/*!
 * ASP.NET SignalR JavaScript Library v1.0.0
 * http://signalr.net/
 *
 * Copyright Microsoft Open Technologies, Inc. All rights reserved.
 * Licensed under the Apache 2.0
 * https://github.com/SignalR/SignalR/blob/master/LICENSE.md
 *
 */

/// <reference path="..\..\SignalR.Client.JS\Scripts\jquery-1.6.4.js" />
/// <reference path="jquery.signalR.js" />
(function ($, window) {
    /// <param name="$" type="jQuery" />
    "use strict";

    if (typeof ($.signalR) !== "function") {
        throw new Error("SignalR: SignalR is not loaded. Please ensure jquery.signalR-x.js is referenced before ~/signalr/hubs.");
    }

    var signalR = $.signalR;

    function makeProxyCallback(hub, callback) {
        return function () {
            // Call the client hub method
            callback.apply(hub, $.makeArray(arguments));
        };
    }

    function registerHubProxies(instance, shouldSubscribe) {
        var key, hub, memberKey, memberValue, subscriptionMethod;

        for (key in instance) {
            if (instance.hasOwnProperty(key)) {
                hub = instance[key];

                if (!(hub.hubName)) {
                    // Not a client hub
                    continue;
                }

                if (shouldSubscribe) {
                    // We want to subscribe to the hub events
                    subscriptionMethod = hub.on;
                }
                else {
                    // We want to unsubscribe from the hub events
                    subscriptionMethod = hub.off;
                }

                // Loop through all members on the hub and find client hub functions to subscribe/unsubscribe
                for (memberKey in hub.client) {
                    if (hub.client.hasOwnProperty(memberKey)) {
                        memberValue = hub.client[memberKey];

                        if (!$.isFunction(memberValue)) {
                            // Not a client hub function
                            continue;
                        }

                        subscriptionMethod.call(hub, memberKey, makeProxyCallback(hub, memberValue));
                    }
                }
            }
        }
    }

    $.hubConnection.prototype.createHubProxies = function () {
        var proxies = {};
        this.starting(function () {
            // Register the hub proxies as subscribed
            // (instance, shouldSubscribe)
            registerHubProxies(proxies, true);

            this._registerSubscribedHubs();
        }).disconnected(function () {
            // Unsubscribe all hub proxies when we "disconnect".  This is to ensure that we do not re-add functional call backs.
            // (instance, shouldSubscribe)
            registerHubProxies(proxies, false);
        });

        proxies.notificationHub = this.createHubProxy('notificationHub');
        proxies.notificationHub.client = {};
        proxies.notificationHub.server = {
            clearConnect: function () {
                return proxies.notificationHub.invoke.apply(proxies.notificationHub, $.merge(["ClearConnect"], $.makeArray(arguments)));
            },

            hello: function () {
                return proxies.notificationHub.invoke.apply(proxies.notificationHub, $.merge(["Hello"], $.makeArray(arguments)));
            },

            newConnect: function (grp) {
                return proxies.notificationHub.invoke.apply(proxies.notificationHub, $.merge(["NewConnect"], $.makeArray(arguments)));
            },

            sendNotifications: function (message) {
                return proxies.notificationHub.invoke.apply(proxies.notificationHub, $.merge(["SendNotifications"], $.makeArray(arguments)));
            },

            updateConnect: function () {
                return proxies.notificationHub.invoke.apply(proxies.notificationHub, $.merge(["UpdateConnect"], $.makeArray(arguments)));
            }
        };

        proxies.schedulerHub = this.createHubProxy('schedulerHub');
        proxies.schedulerHub.client = {};
        proxies.schedulerHub.server = {
            clearConnect: function () {
                return proxies.schedulerHub.invoke.apply(proxies.schedulerHub, $.merge(["ClearConnect"], $.makeArray(arguments)));
            },

            hello: function () {
                return proxies.schedulerHub.invoke.apply(proxies.schedulerHub, $.merge(["Hello"], $.makeArray(arguments)));
            },

            sendCommand: function (data) {
                return proxies.schedulerHub.invoke.apply(proxies.schedulerHub, $.merge(["SendCommand"], $.makeArray(arguments)));
            },

            updateConnect: function (grp) {
                return proxies.schedulerHub.invoke.apply(proxies.schedulerHub, $.merge(["UpdateConnect"], $.makeArray(arguments)));
            }
        };

        proxies.tableHub = this.createHubProxy('tableHub');
        proxies.tableHub.client = {};
        proxies.tableHub.server = {
            clearConnect: function () {
                return proxies.tableHub.invoke.apply(proxies.tableHub, $.merge(["ClearConnect"], $.makeArray(arguments)));
            },

            hello: function () {
                return proxies.tableHub.invoke.apply(proxies.tableHub, $.merge(["Hello"], $.makeArray(arguments)));
            },

            sendCommand: function (message) {
                return proxies.tableHub.invoke.apply(proxies.tableHub, $.merge(["SendCommand"], $.makeArray(arguments)));
            },

            updateConnect: function (grp) {
                return proxies.tableHub.invoke.apply(proxies.tableHub, $.merge(["UpdateConnect"], $.makeArray(arguments)));
            }
        };

        return proxies;
    };

    signalR.hub = $.hubConnection("http://localhost:49288/signalr", { useDefaultPath: false });
    $.extend(signalR, signalR.hub.createHubProxies());

}(window.jQuery, window));