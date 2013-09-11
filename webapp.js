var ObjectID = require('bson').ObjectID

  , utils = require('./lib/utils')

module.exports = {
  config: [{
    id: String,
    // TODO do we want configurable triggers?
    // trigger: {type: String, default: 'job.done'},
    url: String,
    secret: String,
    format: String
  }],
  // global events
  listen: function (io, context) {
    io.on('plugin.webhooks.fire', function (url, secret, payload) {
      utils.fire(hook.url, hook.secret, payload)
    })
  },
  // prefixed by /:repo/:name/api/:pluginname
  // req.pluginConfig() -> get the config for this plugin
  // req.pluginConfig(config, cb(err)) -> set the config for this plugin
  routes: function (app) {
    app.post('/', function (req, res) {
      var id = new ObjectID().toString()
        , hooks = req.pluginConfig()
      hooks.push({
        id: id,
        trigger: req.body.trigger || 'job.done',
        url: req.body.url,
        format: req.body.format
      })
      req.pluginConfig(hooks, function (err) {
        if (err) return res.send({error: 'Failed to add webhook', more: err})
        res.send({success: true, id: id})
      })
    })
    app.put('/:id', function (req, res) {
      var hooks = req.project.plugins.webhooks
        , found = -1
      for (var i=0; i<hooks.length; i++) {
        if (hooks[i].id === req.params.id) {
          found = i
          break
        }
      }
      if (found === -1) {
        res.status(404)
        return res.send('Webhook not found')
      }
      hooks[i] = req.body
    })
    app.get('/', function (req, res) {
      res.send({hooks: req.project.plugins.webhooks})
    })
    app.delete('/:id', function (req, res) {
      var hooks = req.project.plugins.webhooks
        , found = -1
      for (var i=0; i<hooks.length; i++) {
        if (hooks[i].id === req.params.id) {
          found = i
          break
        }
      }
      if (found === -1) {
        res.status(404)
        return res.send('Webhook not found')
      }
      hooks.splice(found, 1)
      req.user.save(function (err) {
        if (err) {
          res.status(500)
          return res.send({error: 'failed to save', info: err})
        }
        res.status(200)
        res.send({success: true})
      })
    })
  }
}
