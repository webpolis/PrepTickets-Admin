function venueController($scope, $timeout, $cookieStore, configService,
    authService, permService, modelService, geoService, placeService,
    errorService, formService) {
  $scope.config = configService, $scope.name = 'venue', $scope.venues = [],
      $scope.wizard = formService.getWizard($scope);

  // catches requests from other controllers so it makes available to the UI all
  // venues from the current $scope.storeKey
  $scope.$on('initVenue', function(ev) {
    $scope.init();

    if (angular.isDefined(ev) && angular.isFunction(ev.stopPropagation)) {
      ev.stopPropagation();
    }
  });

  // watch for update/create requests
  $scope.$watch('wizard.open', function(v) {
    if (v) {
      $('#formVenue').modal({
        show : true,
        backdrop : 'static'
      });
    }
  });

  $scope.$watch('wizard.saved', function(v) {
    if (v) {
      $scope.wizard.checkStep = {}
    }
  })

  $scope.init = function() {
    $scope.storeKey = $scope.storeKey
        || $cookieStore.get(configService.cookies.storeKey);

    placeService.listPlacesAsync($scope.storeKey, 0).then(
        function() {
          $scope.venues = placeService.getPlaces();

          if ($scope.venues.length > 0) {
            angular.forEach($scope.venues, function(venue, i) {
              placeService.initPlace($scope.storeKey, venue.Key).then(
                  function(place) {
                    $scope.venues[i] = place;
                  })
            });
          }
        }, function(err) {
          errorService.log(err)
        });
  }

  $scope.update = function(venue) {
    $scope.Place = venue;
    $scope.wizard.open = true;
    $scope.wizard.saved = false;
    $scope.wizard.finished = false;
    $scope.wizard.currentStep = 1;

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
    $scope.Place = modelService.getInstanceOf('Place');
    $scope.Place.Address = modelService.getInstanceOf('Address');
    $scope.wizard.open = true;
    $scope.wizard.saved = false;
    $scope.wizard.finished = false;
    $scope.wizard.currentStep = 1
  }

  $scope.save = function() {
    if ($scope.wizard.finished) {
      $scope.wizard.saved = false;

      if ($scope.Place.Key === null) {
        // create place

        // API claims not null properties
        modelService.nonNull($scope.Place.Address);

        var newPlace = {
          Public : true,
          Name : $scope.Place.Name,
          Description : $scope.Place.Description,
          Address : $scope.Place.Address
        };

        placeService.createPlace($scope.storeKey, newPlace).then(
            function(placeKey) {
              if (angular.isString(placeKey)) {
                newPlace.Key = placeKey;
                $scope.venues.push(newPlace);

                $scope.wizard.saved = true;

                // reload list
                $scope.init();
              }
            }, function(err) {
              errorService.log(err)
            });
      } else {
        // update place
        placeService.updatePlace($scope.storeKey, $scope.Place).then(
            function(place) {
              geoService.updateAddress(place.Address).then(function(ret) {
                $scope.wizard.saved = true;

                // reload list
                $scope.init();
              }, function(err) {
                errorService.log(err)
              });
            });
      }
    }
  }
}

venueController.$inject = [
    '$scope', '$timeout', '$cookieStore', 'configService', 'authService',
    'permService', 'modelService', 'geoService', 'placeService',
    'errorService', 'formService'
];