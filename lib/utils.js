
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

var DEFAULT_FORMAT = {
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

function makeHook(format, job) {
  format = format || DEFAULT_FORMAT
  return function (data, job) {
    return crawlTree(format, getHookValue.bind(null, data, job))
  }
}

function makeWebHooks(hooks, job) {
  var hook
  for (var i=0; i<hooks.length; i++) {
    hook = hooks[i]
    hook.prepare = makeHook(hook.format, job)
  }
  return hooks
}
