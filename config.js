if (Meteor.isClient) {
  Template.config.channels = function () {
    return [{number: 16, description: 'beta'},
            {number: 17, description: 'gamma'},

            {number: 18, description: 'xShift'},
            {number: 19, description: 'yShift'},
            {number: 20, description: 'zShift'}]
  }

  Template.config.events({
    'click .channels__target, touchstart .channels__target': function(e) {
      var $target = $(e.currentTarget),
          channel = $target.attr('data-channel');
      $target.addClass('channels__target--pop');
      setTimeout(function() {
        $target.removeClass('channels__target--pop');
      }, 400);
      console.log('setting up', channel);
      Meteor.call('setupChannel', channel);
    }
  });
}
