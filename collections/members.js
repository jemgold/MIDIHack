
Members = new Meteor.Collection('members');

Members.all = function () {
  return Members.find({}).fetch();
}

Members.active = function() {
  return Members.find({active: true});
}

Members.inactive = function() {
  return Members.find({active: false});
}

Members.currentUser = function() {
  return Members.findOne(SessionAmplify.get('myID'));
}

Members.currentUserRole = function() {
  if (Members.currentUser() !== undefined) {
    return Members.currentUser().role;
  }
}
Members.currentUserInstrument = function() {
  if (Members.currentUser() !== undefined) {
    return Members.currentUser().instrument;
  }
}

var ROLES = [
  {instrument: 'rotation', role: 'beta'},
  {instrument: 'rotation', role: 'gamma'},
  {instrument: 'motion', role: 'xShift'},
  {instrument: 'motion', role: 'zShift'},
];

var numberOfActiveMembers = 2;

//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/array/shuffle [v1.0]
function shuffle(o){ //v1.0
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

Members.passTheParcel = function() {
  // Shuffle roles
  shuffle(ROLES);

  // Fetch current state
  var currentMembers = Members.active().fetch();
  var inactiveMembers = Members.inactive().fetch();
  var newMembers = shuffle(inactiveMembers).slice(0, numberOfActiveMembers);

  // Disable current members
  _.each(currentMembers, function(member) {
    Members.update(member, {$set: {
      active: false,
      instrument: null,
      role: null,
  }});
  })

  // Enable new members
  _.each(newMembers, function(member, i) {
    Members.update(member, {$set: {
      active: true,
      instrument: ROLES[i]['instrument'],
      role: ROLES[i]['role'],
    }});
  });
}

var timerID;

Meteor.methods({
  passTheParcel: function() {
    Members.passTheParcel();
  }
});
if (Meteor.isServer) {
  Meteor.methods({
    kickoff: function() {
      timerID = Meteor.setInterval(function() {
        Meteor.call('passTheParcel');
      }, 5000);
    },
    pause: function() {
      Meteor.clearInterval(timerID);
    },
    kick: function() {
      Members.remove({});
    }
  })
}

function isMobileSafari() {
  return navigator.userAgent.match(/(iPad|iPhone|iPod touch);.*CPU.*OS 7_\d/i);
}



if (Meteor.isClient) {
  Meteor.startup(function() {
    if (!isMobileSafari()) {
      return;
    }
    if (SessionAmplify.get('myID') === undefined) {
      var myID = Members.insert({
        active: false,
        instrument: null,
        role: null
      });
      SessionAmplify.set('myID', myID);
    }
  });

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
    },
    'click .kick': function() {
      Meteor.call('kick');
    }
  });

  Template.gyro.currentUserActive = function() {
    return Members.find({_id: SessionAmplify.get('myID'), active: true }).count() === 1;
  }
}
