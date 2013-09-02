
var request = require('superagent')
  , crypto = require('crypto')
  , qs = require('querystring')

module.exports = {
  fire: fire,
  makeWebHooks: makeWebHooks
}

function fire(url, secret, payload) {
  var hmac = crypto.createHmac('sha1', secret)
    , body = {payload: payload}
    , signature = 'sha1='
  hmac.update(qs.stringify(body).toString('utf8'))
  signature += hmac.digest('hex')
  request.post(url)
    .set('x-hub-signature', signature)
    .send(body)
}

var DEFAULT_FORMATS = {
  'job.done': {
    // job data
    project: 'job.project.name',
    github_commit_id: 'job.ref.id',
    repo_url: 'job.project.provider.url',
    // results
    deploy_exitcode: 'data.deploy_status',
    test_exitcode: 'data.test_status',
    finish_time: 'data.finished',
    start_time: 'data.started'
  }
}

function crawlTree(obj, fn) {
  var res = {}
  for (var key in obj) {
    if (object === typeof obj[key]) {
      res[key] = crawlTree(obj[key])
    } else {
      res[key] = fn(obj[key])
    }
  }
  return res
}

function getHookValue(data, job, key) {
  if ('string' !== typeof key) return key
  var parts = key.split('.')
  if (['data', 'job'].indexOf(parts[0]) === -1) return key
  return parts.reduce(function (obj, part) {
    return obj ? obj[part] : obj
  }, { data: data, job: job })
}

function makeHook(trigger, format, job) {
  format = format || DEFAULT_FORMATS[trigger]
  if (!format) {
    throw new Error('No default format for "' + trigger + '" and no format provided.')
  }
  return function (data, job) {
    if (data.length === 1) data = args[0]
    return crawlTree(format, getHookValue.bind(null, data, job))
  }
}

function makeWebHooks(hooks, job) {
  var triggers = []
    , tmap = {}
    , trigger
    , hook
    , def
  for (var i=0; i<hooks.length; i++) {
    hook = hooks[i]
    trigger = tmap[hook.trigger]
    if (!trigger) {
      trigger = tmap[hook.trigger] = {
        event: hook.trigger,
        hooks: []
      }
      triggers.push(trigger)
    }
    hook.prepare = makeHook(hook.trigger, hook.format, job)
    trigger.hooks.push(hook)
  }
  return triggers
}
