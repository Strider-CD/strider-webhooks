
var utils = require('./lib/utils')

module.exports = {
  // run for each job
  init: function (config, job, context, cb) {
    var hooks = utils.makeWebHooks(config, job)
    cb(null, {
      listen: function (io, context) {
        io.on('job.done', function (data) {
          hooks.forEach(function (hook) {
            payload = hook.prepare(data, job)
            io.emit('plugin.webhooks.fire', hook.url, hook.secret, payload)
          })
        })
      }
    })
  },
}
