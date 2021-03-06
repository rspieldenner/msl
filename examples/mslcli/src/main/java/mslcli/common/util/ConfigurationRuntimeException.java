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

package mslcli.common.util;

/**
 * <p>
 * Wrapper class for ConfigurationException.
 * It is used to be thrown from the existing MSL core methods
 * which cannot be modified to throw ConfigurationException.
 * </p>
 *
 * @author Vadim Spector <vspector@netflix.com>
 */
public class ConfigurationRuntimeException extends RuntimeException {
    /** for proper serialization */
    private static final long serialVersionUID = 2452369560136305840L;
    /**
     * @param cause exception cause
     */
    public ConfigurationRuntimeException(ConfigurationException cause) {
        super(cause);
    }
}

