Members = new Meteor.Collection('members');

Meteor.methods({
  passTheParcel: function() {
    var currentMembers = Members.active();

    var inactiveMembers = Members.inactive();

    Members.all().forEach(function(cm) {
      Members.update(cm, {$set: {active: !cm.active} } );
    });

    // TODO: this should pick 3 people to be next
    // currentMembers.forEach(function(cm) {
    //   Members.update(cm, {$set: {active: false} } );
    // });
  }
});

Members.all = function () {
  return Members.find({}).fetch();
}

Members.active = function() {
  return Members.find({active: true});
}

Members.inactive = function() {
  return Members.find({active: false});
}


if (Meteor.isClient) {
  Meteor.startup(function() {
    if (SessionAmplify.get('myID') === undefined) {
      r = prompt('name?');
      var myID = Members.insert({username: r, active: false, instrument: 'gyro'});
      SessionAmplify.set('myID', myID);
    }
  });

  Template.members.members = function() {
    return Members.all({});
  }

  Template.members.events({
    'click .switcheroo': function(e) {
      Meteor.call('passTheParcel');
    }
  });

  Template.gyro.currentUserActive = function() {
    return Members.find({_id: SessionAmplify.get('myID'), active: true }).count() === 1;
  }
}

if (Meteor.isServer) {
  Meteor.setInterval(function() {
    Meteor.call('passTheParcel');
  }, 2000);
}

UI.registerHelper('wrapperClass', function(currentUserActive) {
  return currentUserActive ? "wrapper wrapper--active" : "wrapper wrapper--inactive";
});
