'use strict';

var _ = require('lodash')

module.exports = ($scope, $routeParams, $location, Event, Questions, Enrollments) => {
  Event.get({id: $routeParams.eventId}).$promise.then((result) => {
    $scope.event = result.event
  })

  Questions.query({eventId: $routeParams.eventId}).$promise.then((result) => {
    $scope.questions = result

    loadEnrollments()
  })

  function loadEnrollments() {
    Enrollments.query({eventId: $routeParams.eventId}).$promise.then((result) => {
      $scope.enrollments = _(result).map('enrollment').map(addAnswerTexts).value()
      
      $scope.enrollmentsByQuota = _.groupBy($scope.enrollments, 'quota_group_id')

      function hasNoQuota(enrollment) { return enrollment.quota_group_id === undefined }
      $scope.enrollmentsWithoutQuota = _.filter($scope.enrollments, hasNoQuota)
    })    
  }

  function addAnswerTexts(enrollment) {
    return _.extend(enrollment, {answerTexts: _.map(enrollment.answers, getAnswerText)})
  }

  function getAnswerText(answer) {
    var matchingQuestion = _.find($scope.questions, {'id': answer.question_id});

    switch (matchingQuestion.type) {
      case "text/name":
      case "text/tel":
      case "text/email":
      case "text/long":
        return answer.value
      case "boolean":
        return answer.value ? 'Yes' : 'No'
      case "select/many":
      case "select/one":
        var optionIds = _.isArray(answer.value) ? answer.value : [answer.value]
        return optionIds.map(id => {
          return _.find(matchingQuestion.options, {'id': id}).value
        }).join(', ')
      default:
        return "";
    }
  }

  $scope.enroll = () => {
    //Enrollments.create().$promise.then((result) => {})
    var enrollmentId = 1
    $location.path($location.path() + '/enrollments/' + enrollmentId)
  }
}