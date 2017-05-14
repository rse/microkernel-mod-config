/*
**  Microkernel -- Microkernel for Server Applications
**  Copyright (c) 2015-2016 Ralf S. Engelschall <rse@engelschall.com>
**
**  Permission is hereby granted, free of charge, to any person obtaining
**  a copy of this software and associated documentation files (the
**  "Software"), to deal in the Software without restriction, including
**  without limitation the rights to use, copy, modify, merge, publish,
**  distribute, sublicense, and/or sell copies of the Software, and to
**  permit persons to whom the Software is furnished to do so, subject to
**  the following conditions:
**
**  The above copyright notice and this permission notice shall be included
**  in all copies or substantial portions of the Software.
**
**  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
**  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
**  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
**  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
**  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
**  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
**  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import path    from "path"
import fs      from "mz/fs"
import co      from "co"
import YAML    from "js-yaml"

export default class Module {
    constructor (options) {
        this.options = Object.assign({
            configfile: null
        }, options || {})
    }
    get module () {
        return {
            name:  "microkernel-mod-config",
            tag:   "CONFIG",
            group: "BOOT",
            after: [ "CTX", "OPTIONS" ]
        }
    }
    latch (kernel) {
        let configfile = this.options.configfile !== null ? this.options.configfile :
            path.join(kernel.rs("ctx:basedir"), kernel.rs("ctx:program") + ".yaml")
        kernel.latch("options:options", (options) => {
            options.push({
                name: "config", type: "string", "default": configfile,
                help: "use YAML file for configuration", helpArg: "FILE" })
        })
    }
    start (kernel) {
        return co(function * () {
            let configfile = kernel.rs("options:options").config
            let exists = yield (fs.exists(configfile))
            if (!exists)
                throw new Error(`configuration file not found: ${configfile}`)
            let yaml = yield (fs.readFile(configfile, "utf8"))
            let config = YAML.safeLoad(yaml, { filename: configfile })
            kernel.rs("config", config)
        }.bind(this))
    }
}

