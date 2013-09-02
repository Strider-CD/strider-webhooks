
var utils = require('./utils')

module.exports = {
  config: [{
    trigger: {type: String, default: 'job.done'},
    url: String,
    format: String
  }],
  init: function (config, job, cb) {
    var triggers = utils.makeWebHooks(config, job)
    cb(null, {
      listen: function (io) {
        triggers.forEach(function (trigger) {
          io.on(trigger.event, function () {
            var hook, payload
            for (var i=0; i<trigger.hooks.length; i++) {
              hook = trigger.hooks[i]
              payload = hook.prepare(arguments, job)
              utils.fire(hook.url, hook.secret, payload)
            }
          })
        })
      }
    })
  }
}
