Members = new Meteor.Collection('members');
var timerID;

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
if (Meteor.isServer) {
  Meteor.methods({
    kickoff: function() {
      timerID = Meteor.setInterval(function() {
        Meteor.call('passTheParcel');
      }, 2000);
    },
    pause: function() {
      Meteor.clearInterval(timerID);
    }
  })
}

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
      var i = Math.round(Math.random());
      var j = Math.round(Math.random());

      var instrument, role;

      if (i === 0) {
        // motion
        instrument = 'rotation';
        if (j === 0) {
          role = 'beta';
        } else {
          role = 'gamma';
        }
      } else {
        // rotation
        instrument = 'motion';
        if (j === 0) {
          role = 'xShift';
        } else {
          role = 'yShift';
        }
      }
      var myID = Members.insert({username: r, active: false, instrument: instrument, role: role});
      SessionAmplify.set('myID', myID);
    }
  });

  Members.currentUser = function() {
    return Members.findOne(SessionAmplify.get('myID'));
  }

  Members.currentUserRole = function() {
    return Members.currentUser().role;
  }
  Members.currentUserInstrument = function() {
    return Members.currentUser().instrument;
  }

  Template.members.members = function() {
    return Members.all({});
  }

  Template.members.events({
    'click .switcheroo': function(e) {
      Meteor.call('passTheParcel');
    },
    'click .kickoff': function() {
      Meteor.call('kickoff');
    },
    'click .pause': function() {
      Meteor.call('pause');
    }
  });

  Template.gyro.currentUserActive = function() {
    return Members.find({_id: SessionAmplify.get('myID'), active: true }).count() === 1;
  }
}


