if (Meteor.isClient) {
  Template.config.channels = function () {
    return _.range(16, 28);
  }

  Template.config.events({
    'click, touchstart .channels__target': function(e) {
      var $target = $(e.currentTarget),
          channel = $target.attr('data-channel');
      $target.addClass('channels__target--pop');
      setTimeout(function() {
        $target.removeClass('channels__target--pop');
      }, 400);
      Meteor.call('setupChannel', channel);
    }
  });
}
