function MotionProcessor(rate, cutoffFrequency) {
  _.bindAll(this, 'update');
  this.velocity = {x: 0, y: 0, z: 0};
  this.position = {x: 0, y: 0, z: 0};

  this.positionLimit = 0.5;
}

MotionProcessor.prototype = {
  update: function(acceleration, interval) {
    // console.log(acceleration.x);

    // Integrate to get velocity
    this.velocity.x = this.velocity.x + acceleration.x * interval;
    this.velocity.y = this.velocity.y + acceleration.y * interval;
    this.velocity.z = this.velocity.z + acceleration.z * interval;

    this.limit(this.velocity, this.positionLimit);

    this.position = this.velocity;
  },

  drag: function(val, interval) {
    var dir = val > 0 ? -1 : 1
    var out = val + this.amountOfDrag * dir * interval;
    if (val > 0) {
      return Math.max(0, out);
    }
    else {
      return Math.min(0, out);
    }
  },

  limit: function(obj, val) {
    obj.x = Math.max(Math.min(obj.x, val), -val);
    obj.y = Math.max(Math.min(obj.y, val), -val);
    obj.z = Math.max(Math.min(obj.z, val), -val);
  },

  positionToMidi: function() {
    return {
      x: Math.floor((this.position.x + this.positionLimit) * 127),
      y: Math.floor((this.position.y + this.positionLimit) * 127),
      z: Math.floor((this.position.z + this.positionLimit) * 127),
    };
  }
};


if (Meteor.isClient) {
  Template.gyro.orientation = function () {
    return Session.get('orientation');
  };

  Template.gyro.position = function () {
    return Session.get('position');
  };

  function decimalify (data) {
    return _.object(_.map(data, function (value, key) {
      var v = value === null ? 0 : value.toFixed(0);
      return [key, v];
    }));
  }

  processor = new MotionProcessor();

  window.addEventListener('devicemotion', function(event) {
    processor.update(event.acceleration, event.interval);
    var position = processor.positionToMidi();
    Session.set('position', position);
    Meteor.call('changePosition', position);
  });

  window.addEventListener("deviceorientation", function(event) {
    Session.set('orientation', decimalify({
      alpha: event.alpha,
      beta: event.beta,
      gamma: event.gamma
    }));
    Meteor.call('changeOrientation', {
      beta: Math.floor((event.beta / 90 ) * 127),
      gamma: Math.floor(( (event.gamma + 45) / 90 ) * 127)
    });
  }, true);

}

if (Meteor.isServer) {
  var midi,
      output,
      op1;

  Meteor.startup(function () {
    midi = Meteor.require('midi');
    output = new midi.output();
    output.openVirtualPort('midihack');
  });

  Meteor.methods({
    changeOrientation: function(orientation) {
      output.sendMessage([176,16,orientation.beta]);
      output.sendMessage([176,17,orientation.gamma]);
    },
    changePosition: function(position) {
      output.sendMessage([176,18,position.x]);
      output.sendMessage([176,19,position.y]);
      output.sendMessage([176,20,position.z]);
    },
    setupChannel: function(channel) {
      output.sendMessage([176, channel, 1]);
    },
    listPorts: function() {
      op1 = new midi.output();
      _.times(op1.getPortCount(), function(n) {
        console.log(n);
        console.log(output.getPortName(n));
      });
      // then…
      // op1.openPort(3);
    }
  });
}
