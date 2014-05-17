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
  // TODO: this should be the real user's id
  Session.set('myID', Members.findOne({})._id);
  Template.members.members = function() {
    return Members.all({});
  }

  Template.members.events({
    'click .switcheroo': function(e) {
      Meteor.call('passTheParcel');
    }
  });

  Template.gyro.currentUserActive = function() {
    return Members.find({_id: Session.get('myID'), active: true }).count() === 1;
  }
}

if (Meteor.isServer) {
  Meteor.setInterval(function() {
    Meteor.call('passTheParcel');
  }, 1500);
}

UI.registerHelper('wrapperClass', function(currentUserActive) {
  return currentUserActive ? "wrapper wrapper--active" : "wrapper wrapper--inactive";
});
