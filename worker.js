
var utils = require('./lib/utils')

module.exports = {
  // run for each job
  init: function (config, job, context, cb) {
    var hooks = utils.makeWebHooks(config || [], job)
    cb(null, {
      listen: function (io, context) {
        io.on('job.status.tested', onTested)
        
        function onTested (id, data){
          hooks.forEach(function (hook) {
            if(hook.trigger === 'test'){
              io.removeListener('job.status.tested', onTested);
              context.comment('Firing Test webhook ' + hook.title)
              try {
                var payload = hook.prepare(data, job)
                io.emit('plugin.webhooks.fire', hook.url, hook.secret, payload)
              } catch (e) {
                context.comment('Failed to prepare webhook payload: ' + e.message);
              }
            }
            else if(hook.trigger === 'deploy'){
              if(job.type === 'TEST_AND_DEPLOY'){
                io.on('job.status.deployed', onDeployed)
              }
              io.removeListener('job.status.tested', onTested);
            }
          })
        }

        function onDeployed (id, data){
          hooks.forEach(function (hook) {
            if(hook.trigger === 'deploy'){
              io.removeListener('job.status.deployed', onDeployed);
              context.comment('Firing Deploy webhook ' + hook.title)
              try {
                var payload = hook.prepare(data, job)
                payload['deploy_exitcode'] = (data.exitCode === 0) ? 0 : 1
                io.emit('plugin.webhooks.fire', hook.url, hook.secret, payload)
              } catch (e) {
                context.comment('Failed to prepare webhook payload: ' + e.message);
              }
            }
          })
        }
      }
    })
  }
}
