if (Meteor.isClient) {
  Template.hello.greeting = function () {
    return "Welcome to MIDIHakk.";
  };

  Template.gyro.pos = function () {
    return gyro.getOrientation();
  };

  Template.hello.events({
    'click input': function () {
      var val = Math.floor(Math.random() * 127);

      Meteor.call('change', val);
    }
  });

  gyro.frequency = 10;
  gyro.startTracking(function(o) {
    // console.log(o.x.toFixed(2), o.y.toFixed(2), o.z.toFixed(2));
    console.log(o.alpha.toFixed(2), o.beta.toFixed(2), o.gamma.toFixed(2));
  });

}

if (Meteor.isServer) {
  var midi,
      output;
  Meteor.startup(function () {
    midi = Meteor.require('midi');

    output = new midi.output();
    output.openVirtualPort('midihack');
  });

  Meteor.methods({
    change: function(value) {
      console.log(value);
      output.sendMessage([176,16,value]);
    }
  });
}
