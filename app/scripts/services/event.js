// event service
azureTicketsApp.factory('eventService', [
    '$q',
    '$rootScope',
    'modelService',
    'configService',
    'geoService',
    function($q, $rootScope, modelService, configService, geoService) {
      var _events = [], _lastAvailableURI = null;

      return {
        listEventsAsync : function(storeKey, pages) {
          var def = $q.defer();

          BWL.Services.ModelService.ListAsync(storeKey, 'Event', pages,
              function(events) {
                if (angular.isArray(events)) {
                  _events = events;
                } else {
                  _events = [];
                }

                $rootScope.$apply(function() {
                  def.resolve();
                });
              }, function(err) {
                $rootScope.$apply(function() {
                  def.reject(err)
                })
              });

          return def.promise;
        },
        getEvents : function() {
          return _events;
        },
        getEvent : function() {
          return modelService.getInstanceOf('Event');
        },
        initEvent : function(storeKey, eventKey) {
          var def = $q.defer();

          BWL.Services.ModelService
              .ReadAsync(storeKey, "Event", eventKey, 10,
                  function(event) {
                    if (!angular.isDefined(event.Address)
                        || event.Address === null) {
                      event.Address = modelService.getInstanceOf('Address');
                    }

                    try {
                      var st = new Date(event.StartTime);
                      var et = new Date(event.EndTime);
                      var sst = new Date(event.OnSaleDateTimeStart);
                      var set = new Date(event.OnSaleDateTimeEnd);
                      event.StartTime = st.getMonth() + '/' + st.getDay() + '/'
                          + st.getFullYear() + ' ' + st.getHours() + ':'
                          + st.getMinutes();
                      event.EndTime = et.getMonth() + '/' + et.getDay() + '/'
                          + et.getFullYear() + ' ' + et.getHours() + ':'
                          + et.getMinutes();
                      event.OnSaleDateTimeStart = sst.getMonth() + '/'
                          + sst.getDay() + '/' + sst.getFullYear() + ' '
                          + sst.getHours() + ':' + sst.getMinutes();
                      event.OnSaleDateTimeEnd = set.getMonth() + '/'
                          + set.getDay() + '/' + set.getFullYear() + ' '
                          + set.getHours() + ':' + set.getMinutes();
                    } catch (e) {
                    }

                    $rootScope.$apply(function() {
                      def.resolve(event)
                    });
                  }, function(err) {
                    $rootScope.$apply(function() {
                      def.reject(err)
                    })
                  }, function(err) {
                    $rootScope.$apply(function() {
                      def.reject(err)
                    })
                  });

          return def.promise;
        },
        createEvent : function(storeKey, event) {
          var def = $q.defer();

          BWL.Services.ModelService.CreateAsync(storeKey, this.getEvent().Type,
              event, function(eventKey) {
                $rootScope.$apply(function() {
                  def.resolve(eventKey)
                });
              }, function(err) {
                $rootScope.$apply(function() {
                  def.reject(err)
                })
              });

          return def.promise;
        },
        deleteEvent : function(storeKey, eventKey) {
          var def = $q.defer();

          BWL.Services.ModelService.DeleteAsync(storeKey, this.getEvent().Type,
              eventKey, function() {
                $rootScope.$apply(function() {
                  def.resolve()
                });
              }, function(err) {
                $rootScope.$apply(function() {
                  def.reject(err)
                })
              });

          return def.promise;
        },
        addEventAddress : function(eventKey, address) {
          var def = $q.defer(), _this = this;

          BWL.Services.ModelService.CreateAsync(eventKey, "Address", address,
              function(addressKey) {
                BWL.Services.ModelService.AddAsync(eventKey, "Event", eventKey,
                    "Address", "Address", addressKey, function(ret) {
                      $rootScope.$apply(def.resolve)
                    }, function(err) {
                      $rootScope.$apply(function() {
                        def.reject(err)
                      })
                    });
              }, function(err) {
                $rootScope.$apply(function() {
                  def.reject(err)
                })
              });

          return def.promise;
        },
        updateEvent : function(storeKey, event) {
          var def = $q.defer(), tmpEvent = angular.copy(event);
          var _event = angular.copy(event);

          delete tmpEvent.Address;

          BWL.Services.ModelService.UpdateAsync(storeKey, 'Event', _event.Key,
              tmpEvent, function(ret) {
                $rootScope.$apply(function() {
                  def.resolve(_event)
                });
              }, function(err) {
                $rootScope.$apply(function() {
                  def.reject(err)
                })
              });

          return def.promise;
        }
      }
    }
]);