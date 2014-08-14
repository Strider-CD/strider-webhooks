
var utils = require('./lib/utils')

module.exports = {
  // run for each job
  init: function (config, job, context, cb) {
    var hooks = utils.makeWebHooks(config || [], job)
    cb(null, {
      listen: function (io, context) {
        io.on('job.status.tested', onTested)
        if(job.type = 'TEST_AND_DEPLOY'){
          io.on('job.status.deployed', onDeployed)
        }
        function onTested (id, data){
          hooks.forEach(function (hook) {
            if(hook.trigger === 'test'){
              context.comment('Firing Test webhook ' + hook.title)
              try {
                var payload = hook.prepare(data, job)
                io.emit('plugin.webhooks.fire', hook.url, hook.secret, payload)
              } catch (e) {
                context.comment('Failed to prepare webhook payload: ' + e.message);
              }
            }
          });
          io.removeListener('job.status.tested', onTested);
          if (data.exitCode !== 0 && job.type === 'TEST_AND_DEPLOY'){
            io.removeListener('job.status.deployed', onDeployed);
          }
        }

        function onDeployed (id, data){
          hooks.forEach(function (hook) {
            if(hook.trigger === 'deploy'){
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
          io.removeListener('job.status.deployed', onDeployed);
        }
      }
    })
  }
}
