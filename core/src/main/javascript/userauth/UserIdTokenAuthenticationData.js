/**
 * Copyright (c) 2014 Netflix, Inc.  All rights reserved.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * <p>User ID token-based user authentication data.</p>
 * 
 * <p>
 * {@code {
 *   "#mandatory" : [ "mastertoken", "useridtoken" ],
 *   "mastertoken" : mastertoken,
 *   "useridtoken" : useridtoken,
 * }} where:
 * <ul>
 * <li>{@code mastertoken} is the master token</li>
 * <li>{@code useridtoken} is the user ID token</li>
 * </ul></p>
 * 
 * @author Wesley Miaw <wmiaw@netflix.com>
 */
var UserIdTokenAuthenticationData;
var UserIdTokenAuthenticationData$parse;

(function() {
    "use strict";
    
    /** JSON master token key. */
    var KEY_MASTER_TOKEN = "mastertoken";
    /** JSON user ID token key. */
    var KEY_USER_ID_TOKEN = "useridtoken";
    
    UserIdTokenAuthenticationData = UserAuthenticationData.extend({
        /**
         * Construct a new user ID token authentication data instance from the
         * provided master token and user ID token.
         * 
         * @param {MasterToken} masterToken the master token.
         * @param {UserIdToken} userIdToken the user ID token.
         */
        init: function init(masterToken, userIdToken) {
            init.base.call(this, UserAuthenticationScheme.USER_ID_TOKEN);
            if (!userIdToken.isBoundTo(masterToken))
                throw new MslInternalException("User ID token must be bound to master token.");
            
            // The properties.
            var props = {
                masterToken: { value: masterToken, writable: false, configurable: false },
                userIdToken: { value: userIdToken, writable: false, configurable: false },
            };
            Object.defineProperties(this, props);
        },

        /** @inheritDoc */
        getAuthData: function getAuthData() {
            var result = {};
            result[KEY_MASTER_TOKEN] = JSON.parse(JSON.stringify(this.masterToken));
            result[KEY_USER_ID_TOKEN] = JSON.parse(JSON.stringify(this.userIdToken));
            return result;
        },

        /** @inheritDoc */
        equals: function equals(that) {
            if (this === that) return true;
            if (!(that instanceof UserIdTokenAuthenticationData)) return false;
            return (equals.base.call(this, this, that) &&
                this.masterToken.equals(that.masterToken) &&
                this.userIdToken.equals(that.userIdToken));
        },
    });
    
    /**
     * Construct a new user ID token authentication data instance from the
     * provided JSON representation.
     * 
     * @param {MslContext} ctx MSl context.
     * @param {Object} userIdTokenAuthJO the JSON object.
     * @param {{result: function(UserIdTokenAuthenticationData), error: function(Error)}}
     *        callback the callback that will receive the user ID token
     *        authentication data or any thrown exceptions.
     * @throws MslEncodingException if there is an error parsing the JSON.
     * @throws MslUserAuthException if the token data is invalid or the user ID
     *         token is not bound to the master token.
     */
    UserIdTokenAuthenticationData$parse = function UserIdTokenAuthenticationData$parse(ctx, userIdTokenAuthJO, callback) {
        AsyncExecutor(callback, function() {
            var masterTokenJo = userIdTokenAuthJO[KEY_MASTER_TOKEN];
            var userIdTokenJo = userIdTokenAuthJO[KEY_USER_ID_TOKEN];
            if (typeof masterTokenJo !== 'object' ||
                typeof userIdTokenJo !== 'object')
            {
                throw new MslEncodingException(MslError.JSON_PARSE_ERROR, "user ID token authdata " + JSON.stringify(userIdTokenAuthJO));
            }
            
            // Convert any MslExceptions into MslUserAuthException because we don't
            // want to trigger entity or user re-authentication incorrectly.
            MasterToken$parse(ctx, masterTokenJo, {
                result: function(masterToken) {
                    UserIdToken$parse(ctx, userIdTokenJo, masterToken, {
                        result: function(userIdToken) {
                            AsyncExecutor(callback, function() {
                                return new UserIdTokenAuthenticationData(masterToken, userIdToken);
                            });
                        },
                        error: function(e) {
                            AsyncExecutor(callback, function() {
                                if (e instanceof MslException)
                                    throw new MslUserAuthException(MslError.USERAUTH_USERIDTOKEN_INVALID, "user ID token authdata " + JSON.stringify(userIdTokenAuthJO), e);
                                throw e;
                            });
                        },
                    })
                },
                error: function(e) {
                    AsyncExecutor(callback, function() {
                        if (e instanceof MslException)
                            throw new MslUserAuthException(MslError.USERAUTH_MASTERTOKEN_INVALID, "user ID token authdata " + JSON.stringify(userIdTokenAuthJO), e);
                        throw e;
                    });
                },
            });
        });
    }
})();