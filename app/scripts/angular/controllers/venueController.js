function venueController($rootScope, $scope, $timeout, $cookieStore, $filter,
    $q) {
  $scope.name = 'venue';

  // initialize wizard for Venue
  $scope.wizardVenue = $scope.form.getWizard($scope);

  // watch for update/create requests
  $scope.$watch('wizardVenue.open', function(v) {
    if (v) {
      $('#formVenue').modal({
        show : true,
        backdrop : 'static'
      });
    }
  });

  $scope.$watch('wizardVenue.saved', function(v) {
    if (v) {
      $scope.wizardVenue.checkStep = {}
    }
  })

  $scope.init = function() {
    $rootScope.$broadcast('initStore', $scope.Store.Key)
  }

  $scope.update = function(venue) {
    $scope.Place = venue;
    $scope.wizardVenue.open = true;
    $scope.wizardVenue.reset();

    // manually load location
    $timeout(function() {
      $scope.$apply(function() {
        if (angular.isDefined($scope.Store)) {
          $scope.$broadcast('loadCountry', $scope.Place.Address);
        }
      })
    }, 500);
  }

  $scope.create = function() {
    // initialize props
    $scope.Place = $scope.model.getInstanceOf('Place');
    $scope.Place.Address = $scope.model.getInstanceOf('Address');
    $scope.wizardVenue.open = true;
    $scope.wizardVenue.reset();
  }

  $scope.deleteVenue = function(venue) {
    if (confirm($filter('t')('Common.Text_RemoveProduct'))) {
      $scope.place.deletePlace($scope.storeKey, venue)
          .then(
              function() {
                // delete address
                if (angular.isDefined(venue.Address)
                    && venue.Address.Key !== null) {
                  $scope.geo.deleteAddress($scope.storeKey, venue.Address.Key)
                      .then(function() {
                        $scope.init();
                      }, function(err) {
                        $scope.error.log(err)
                      });
                } else {
                  $scope.init();
                }
              }, function(err) {
                $scope.error.log(err)
              });
    }
  }

  $scope.save = function() {
    if ($scope.wizardVenue.finished) {
      $scope.wizardVenue.saved = false;

      if ($scope.Place.Key === null) {
        // create place

        // API claims not null properties
        $scope.model.nonNull($scope.Place.Address);

        var newPlace = {
          Public : true,
          Name : $scope.Place.Name,
          Description : $scope.Place.Description,
          Address : $scope.Place.Address
        };

        $scope.place.createPlace($scope.storeKey, newPlace).then(
            function(placeKey) {
              if (angular.isString(placeKey)) {
                $scope.wizardVenue.saved = true;

                // reload list
                $scope.init();
              }
            }, function(err) {
              $scope.error.log(err)
            });
      } else {
        // update place
        $scope.place.updatePlace($scope.storeKey, $scope.Place).then(
            function(place) {
              $scope.geo.updateAddress(place.Address).then(function(ret) {
                $scope.wizardVenue.saved = true;

                // reload list
                $scope.init();
              }, function(err) {
                $scope.error.log(err)
              });
            });
      }
    }
  }
}

venueController.$inject = [ '$rootScope', '$scope', '$timeout', '$cookieStore',
    '$filter', '$q' ];