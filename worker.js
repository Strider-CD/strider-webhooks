
var utils = require('./lib/utils')



function onDeployed (id, data){
  io.removeListener('job.status.deployed', onDeployed)
  hooks.forEach(function (hook) {
    context.comment('Firing Deploy webhook ' + hook.title)
    try {
      var payload = hook.prepare(data, job)
      payload['deploy_exitcode'] = (data.exitCode === 0) ? 0 : 1
      io.emit('plugin.webhooks.fire', hook.url, hook.secret, payload)
    } catch (e) {
      context.comment('Failed to prepare webhook payload: ' + e.message);
    }
  })
}


module.exports = {
  // run for each job
  init: function (config, job, context, cb) {
    var hooks = utils.makeWebHooks(config || [], job)
    console.log('init wh', config, hooks)
    cb(null, {
      listen: function (io, context) {
        io.on('job.status.tested', onTested);
        io.on('job.status.deployed', onDeployed)
        
        function onTested (id, data){
          io.removeListener('job.status.tested', onTested);
          hooks.forEach(function (hook) {
            context.comment('Firing Test webhook ' + hook.title)
            try {
              var payload = hook.prepare(data, job)
              io.emit('plugin.webhooks.fire', hook.url, hook.secret, payload)
            } catch (e) {
              context.comment('Failed to prepare webhook payload: ' + e.message);
            }
          })
        }
        function onDeployed (id, data){
          io.removeListener('job.status.deployed', onDeployed)
          hooks.forEach(function (hook) {
            context.comment('Firing Deploy webhook ' + hook.title)
            try {
              var payload = hook.prepare(data, job)
              payload['deploy_exitcode'] = (data.exitCode === 0) ? 0 : 1
              io.emit('plugin.webhooks.fire', hook.url, hook.secret, payload)
            } catch (e) {
              context.comment('Failed to prepare webhook payload: ' + e.message);
            }
          })
        }
      }
    })
  }
}
