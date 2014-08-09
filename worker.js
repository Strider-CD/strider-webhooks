
var utils = require('./lib/utils')

module.exports = {
  // run for each job
  init: function (config, job, context, cb) {
    var hooks = utils.makeWebHooks(config || [], job)
    console.log('init wh', config, hooks)
    cb(null, {
      listen: function (io, context) {
        io.on('job.status.tested', function (id, data) {
          hooks.forEach(function (hook) {
            context.comment('Firing webhook ' + hook.title)
            try {
              var payload = hook.prepare(data, job)
              io.emit('plugin.webhooks.fire', hook.url, hook.secret, payload)
            } catch (e) {
              context.comment('Failed to prepare webhook payload: ' + e.message);
              return
            }
          })
        })
        io.on('job.status.deployed', function (id, data){
          hooks.forEach(function (hook) {
            context.comment('Firing webhook ' + hook.title)
            try {
              var payload = hook.prepare(data, job)
              payload['deploy_exitcode'] = return (data.exitCode === 0) ? 0 : 1 ;
              console.log(data);
              io.emit('plugin.webhooks.fire', hook.url, hook.secret, payload)
            } catch (e) {
              context.comment('Failed to prepare webhook payload: ' + e.message);
              return
            }
          })
        })
      }
    })
  },
}
