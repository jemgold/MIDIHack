State = new Meteor.Collection("state");

function setState(key, value) {
  State.upsert({key: key}, {key: key, value: value});
}
function getState(key) {
  obj = State.findOne({key: key});
  if (obj) {
    return obj['value'];
  }
}

if (Meteor.isClient) {
  Template.hello.greeting = function () {
    return "Welcome to MIDIHakk.";
  };

  Template.gyro.pos = function () {
    return Session.get('o');
  };

  Template.gyro.example = function() {
    return getState('example');
  };

  Template.hello.events({
    'click input': function () {
      var val = Math.floor(Math.random() * 127);
      Meteor.call('change', val);
    }
  });

  function decimalify (data) {
    return _.object(_.map(data, function (value, key) {
      var v = value === null ? 0 : value.toFixed(0);
      return [key, v];
    }));
  }
  gyro.frequency = 100;
  gyro.startTracking(function(o) {
    Session.set('o', decimalify(o));
    Meteor.call('changeBeta', Math.floor((Session.get('o').beta / 90 ) * 127) );
    Meteor.call('changeGamma', Math.floor(( (Session.get('o').gamma + 45) / 90 ) * 127) );

    handleZ();
  });
  function handleZ () {
    var z = parseInt(Session.get('o').z);
    if (Session.get('prevZ') === z) {
      return false;
    }
    Session.set('prevZ', z);

    var toSend = Math.floor( Math.min(127, Math.max(0, ((z / -10) * 127))));
    console.log(toSend);
    Meteor.call('changeZ', toSend);
  };

}

if (Meteor.isServer) {
  var midi,
      output,
      op1;

  Meteor.startup(function () {
    midi = Meteor.require('midi');

    output = new midi.output();
    output.openVirtualPort('midihack');

    var i = 0;
    Meteor.setInterval(function() {
      setState('example', i);
      i++;
    }, 1000);

    // op1 = new midi.output();
    // // _.times(op1.getPortCount(), function(n) {
    // //   console.log(n);
    // //   console.log(output.getPortName(n));
    // // });
    // op1.openPort(3);

    // setTimeout(function() {
      // setup methods
      // output.sendmessage([176,16,127]);
      // output.sendMessage([176,17,1]);
    // }, 500);
  });

  Meteor.methods({
    changeZ: function(value) {
      output.sendMessage([176,17,value]);
      // op1.sendMessage([176,1,value]);
    },
    changeBeta: function(value) {
      output.sendMessage([176,16,value]);
      // op1.sendMessage([176,4,value]);
    },
    changeGamma: function(value) {
      // op1.sendMessage([176,1,value]);
    }
  });

}
