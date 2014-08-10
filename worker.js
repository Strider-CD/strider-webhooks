
var utils = require('./lib/utils')

function onTested (id, data){
  io.removeListener('job.status.tested', onTested)
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
}

function onDeployed (id, data){
  io.removeListener('job.status.deployed', onDeployed)
  hooks.forEach(function (hook) {
    context.comment('Firing webhook ' + hook.title)
    try {
      var payload = hook.prepare(data, job)
      payload['deploy_exitcode'] = (data.exitCode === 0) ? 0 : 1
      console.log(data);
      io.emit('plugin.webhooks.fire', hook.url, hook.secret, payload)
    } catch (e) {
      context.comment('Failed to prepare webhook payload: ' + e.message);
      return
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
      }
    })
  },
}
