
app.controller('WebhooksCtrl', ['$scope', function ($scope) {
  function remove(ar, item) {
    ar.splice(ar.indexOf(item), 1);
  }
  $scope.hooks = $scope.pluginConfig('webhooks');
  if (!$scope.hooks.length) $scope.hooks.push({});

  $scope.remove = function (hook) {
    remove($scope.hooks, hook);
    $scope.saving = true;
    $scope.pluginConfig('webhooks', $scope.hooks, function (err) {
      $scope.saving = false;
      if (err) $scope.hooks.push(hook);
    });
  };

  $scope.save = function () {
    $scope.saving = true;
    $scope.pluginConfig('webhooks', $scope.hooks, function (err) {
      $scope.saving = false;
    });
  };

  $scope.add = function () {
    $scope.hooks.push({});
  };
}]);
