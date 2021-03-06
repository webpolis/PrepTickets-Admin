// account service
azureTicketsApp.factory('accountService', [
    '$q',
    '$rootScope',
    '$cookieStore',
    '$timeout',
    'modelService',
    'configService',
    'objectService',
    'geoService',
    function($q, $rootScope, $cookieStore, $timeout, modelService,
        configService, objectService) {
      return {
        accessRequest : function(type, key, level) {
          var def = $q.defer();

          BWL.Services.AccountService.AccessRequestAsync(type, key, level,
              function(ret) {
                $rootScope.$apply(function() {
                  def.resolve(ret);
                });
              }, function(err) {
                $rootScope.$apply(function() {
                  def.reject(err)
                })
              });

          return def.promise;
        },
        accessRequestFor : function(type, key, profileKey, access) {
          var def = $q.defer();

          BWL.Services.AccountService.AccessRequestForAsync(type, key,
              profileKey, access, function(ret) {
                $rootScope.$apply(function() {
                  def.resolve(ret);
                });
              }, function(err) {
                $rootScope.$apply(function() {
                  def.reject(err)
                })
              });

          return def.promise;
        },
        getAccessRequests : function() {
          var def = $q.defer();

          BWL.Services.AccountService.AccessPendingAsync(function(ret) {
            $rootScope.$apply(function() {
              def.resolve(ret);
            });
          }, function(err) {
            $rootScope.$apply(function() {
              def.reject(err)
            })
          });

          return def.promise;
        },
        approveRequest : function(approvalKey) {
          var def = $q.defer();

          BWL.Services.AccountService.AccessApproveAsync(approvalKey, function(
              ret) {
            $rootScope.$apply(function() {
              def.resolve(ret);
            });
          }, function(err) {
            $rootScope.$apply(function() {
              def.reject(err)
            })
          });

          return def.promise;
        },
        rejectRequest : function(approvalKey) {
          var def = $q.defer();

          BWL.Services.AccountService.AccessRejectAsync(approvalKey, function(
              ret) {
            $rootScope.$apply(function() {
              def.resolve(ret);
            });
          }, function(err) {
            $rootScope.$apply(function() {
              def.reject(err)
            })
          });

          return def.promise;
        }
      }
    } ]);